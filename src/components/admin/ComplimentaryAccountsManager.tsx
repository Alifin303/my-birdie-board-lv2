
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addYears } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ComplimentaryAccount {
  id: string;
  email: string;
  notes: string | null;
  created_at: string;
}

export function ComplimentaryAccountsManager() {
  const [accounts, setAccounts] = useState<ComplimentaryAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complimentary_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching complimentary accounts:', error);
      toast.error('Failed to load complimentary accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsAdding(true);
      const email = newEmail.trim().toLowerCase();
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('complimentary_accounts')
        .upsert(
          {
            email,
            notes: newNotes.trim() || null,
            created_by: userData.user?.id ?? null,
          },
          { onConflict: 'email' }
        );

      if (error) throw error;

      // Also grant premium on the member's subscription, same as the user detail page
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (profile?.id) {
        const expiry = addYears(new Date(), 100).toISOString();
        const { data: existingSub } = await supabase
          .from('customer_subscriptions')
          .select('id, status')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (existingSub) {
          if (!['active', 'trialing', 'paid'].includes(existingSub.status)) {
            const { error: subError } = await supabase
              .from('customer_subscriptions')
              .update({ status: 'complimentary', current_period_end: expiry, cancel_at_period_end: false })
              .eq('user_id', profile.id);
            if (subError) throw subError;
          }
        } else {
          const { error: subError } = await supabase.from('customer_subscriptions').insert({
            user_id: profile.id,
            customer_id: `comp_${profile.id}`,
            status: 'complimentary',
            current_period_end: expiry,
            cancel_at_period_end: false,
          });
          if (subError) throw subError;
        }
        toast.success('Complimentary access granted');
      } else {
        toast.success('Email added — access applies once they sign up');
      }

      setNewEmail("");
      setNewNotes("");
      setShowAddForm(false);
      fetchAccounts();
    } catch (error: any) {
      console.error('Error adding complimentary account:', error);
      toast.error(`Failed to add complimentary account${error?.message ? `: ${error.message}` : ''}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAccount = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('complimentary_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Revoke complimentary subscription for the matching member (paid subs untouched)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (profile?.id) {
        const { error: subError } = await supabase
          .from('customer_subscriptions')
          .update({ status: 'canceled', current_period_end: new Date().toISOString() })
          .eq('user_id', profile.id)
          .eq('status', 'complimentary');
        if (subError) throw subError;
      }

      toast.success(`Removed ${email} from complimentary accounts`);
      fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting complimentary account:', error);
      toast.error(`Failed to remove complimentary account${error?.message ? `: ${error.message}` : ''}`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-500" />
          <CardTitle>Complimentary Accounts</CardTitle>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "default"}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Add New Complimentary Account</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="Reason for complimentary access..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddAccount} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Add Account
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewEmail("");
                  setNewNotes("");
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No complimentary accounts configured
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.notes || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(account.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Complimentary Access?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove complimentary premium access for {account.email}. 
                            They will need to subscribe to continue using premium features.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAccount(account.id, account.email)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
