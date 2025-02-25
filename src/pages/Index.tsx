
import { MainContent } from "@/components/MainContent";

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1600170384787-dbab8b355c79?auto=format&fit=crop&q=80')`,
      }}
    >
      <MainContent />
    </div>
  );
};

export default Index;
