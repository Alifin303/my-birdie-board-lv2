import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, Square, RefreshCw } from "lucide-react";

type Status = {
  requestsToday: number; dailyCap: number; pausedReason: string | null;
  placesLeft: number; pending: number; importedTotal: number; skippedTotal: number;
  coursesInDatabase: number;
};

const STOP_MESSAGES: Record<string, string> = {
  daily_limit: "Stopped: today's request allowance is used up. Try again tomorrow.",
  rate_limited: "Stopped: the course service asked us to slow down. Try again in a little while.",
  no_more_places: "Stopped: every place on the search list has been searched.",
  busy: "Another import is already running.",
  paused: "Import is paused.",
};

async function call(action: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("course-import", { body: { action, ...extra } });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* keep */ }
    throw new Error(msg);
  }
  return data;
}

export function CourseImporter() {
  const [status, setStatus] = useState<Status | null>(null);
  const [target, setTarget] = useState("2000");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => { call("status").then(setStatus).catch((e) => setMessage(e.message)); }, []);

  const run = async () => {
    const goal = Number(target);
    cancelRef.current = false;
    setRunning(true); setDone(0); setMessage(null);
    let count = 0;
    try {
      while (count < goal && !cancelRef.current) {
        const res = await call("run", { maxNew: Math.min(200, goal - count) });
        count += res.imported ?? 0;
        setDone(count);
        setStatus(res);
        if (res.stop) {
          setMessage(res.stop === "paused" && res.reason ? res.reason : STOP_MESSAGES[res.stop] ?? res.stop);
          break;
        }
        await new Promise((r) => setTimeout(r, 1500)); // cooldown between batches
      }
      if (count >= goal) setMessage(`Finished: ${count} new courses added.`);
      else if (cancelRef.current) setMessage(`Stopped by you after ${count} new courses.`);
    } catch (e) {
      setMessage(`Import stopped: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const resume = async () => setStatus(await call("resume"));
  const goal = Number(target);
  const [placesText, setPlacesText] = useState("");
  const [adding, setAdding] = useState(false);
  const addPlaces = async () => {
    const terms = placesText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (!terms.length) return;
    setAdding(true);
    try {
      const res = await call("add_terms", { terms });
      setMessage(`Added ${res.added} new places to search${res.alreadyListed ? ` (${res.alreadyListed} were already on the list)` : ""}.`);
      setPlacesText("");
      setStatus(await call("status"));
    } catch (e) {
      setMessage(`Couldn't add places: ${(e as Error).message}`);
    } finally { setAdding(false); }
  };

  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Import Courses</CardTitle>
        <CardDescription>
          Pull new courses from the course service into the public courses directory. Searches UK &amp; Ireland first,
          then worldwide. Only courses with a complete hole-by-hole scorecard are added.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Courses in database" value={status.coursesInDatabase} />
            <Stat label="Imported so far" value={status.importedTotal} />
            <Stat label="Requests used today" value={`${status.requestsToday} / ${status.dailyCap}`} />
            <Stat label="Places left to search" value={status.placesLeft} />
          </div>
        )}
        {running && (
          <div className="space-y-1">
            <Progress value={Math.min(100, (done / goal) * 100)} />
            <p className="text-sm text-muted-foreground">{done} of {goal} new courses added — keep this page open.</p>
          </div>
        )}
        {status?.pausedReason && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 p-3 text-sm">
            <span className="text-destructive">Paused: {status.pausedReason}</span>
            <Button size="sm" variant="outline" onClick={resume}>Resume</Button>
          </div>
        )}
        {message && <p className="text-sm">{message}</p>}
        <div className="space-y-2 rounded-md border p-3">
          <label htmlFor="import-places" className="text-sm font-medium">Add more places to search</label>
          <p className="text-xs text-muted-foreground">
            One per line or comma-separated — towns, counties, states, regions or words like "Links" or "Golf Club".
            Specific places find more courses than broad ones, because each search returns a limited number of results.
          </p>
          <textarea id="import-places" value={placesText} onChange={(e) => setPlacesText(e.target.value)}
            rows={4} disabled={running || adding} placeholder={"Harrogate\nCounty Kerry\nAlgarve\nMyrtle Beach"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button size="sm" variant="outline" onClick={addPlaces} disabled={running || adding || !placesText.trim()}>
            {adding ? "Adding…" : "Add places"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          New courses appear on the public courses page after the next publish.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Select value={target} onValueChange={setTarget} disabled={running}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["100", "500", "1000", "2000"].map((v) => (
              <SelectItem key={v} value={v}>Up to {Number(v).toLocaleString()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {running ? (
          <Button variant="outline" onClick={() => { cancelRef.current = true; }}>
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button onClick={run} disabled={!!status?.pausedReason}>
            <Download className="mr-2 h-4 w-4" /> Import new courses
          </Button>
        )}
        <Button variant="ghost" size="icon" disabled={running} aria-label="Refresh"
          onClick={() => call("status").then(setStatus)}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}
