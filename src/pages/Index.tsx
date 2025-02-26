
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80')`,
      }}
    >
      <div className="absolute top-4 right-4">
        <LoginDialog />
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <MainContent />
      </div>
    </div>
  );
};

export default Index;
