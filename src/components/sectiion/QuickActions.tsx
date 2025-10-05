import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, TrendingUp, Map, Satellite } from "lucide-react";

export default function QuickActions() {
  return (
    <section id="quick-actions" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Health Insights */}
          <ActionCard
            title="Health Risk Insights"
            description="Learn how air quality affects your well-being."
            href="/health"
            icon={Activity}
          />

          {/* Trends & Forecasts */}
          <ActionCard
            title="Forecasts & Trends"
            description="See upcoming air quality patterns."
            href="/trends"
            icon={TrendingUp}
          />

          {/* Pollution Map */}
          <ActionCard
            title="Pollution Map"
            description="Explore pollution hotspots near you."
            href="/pollution-map"
            icon={Map}
          />

          {/* TEMPO Overview */}
          <ActionCard
            title="About TEMPO"
            description="Discover NASA’s air monitoring mission."
            href="/tempo"
            icon={Satellite}
          />
        </div>
      </div>
    </section>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function ActionCard({ title, description, href, icon: Icon }: ActionCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full flex flex-col items-center text-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <Icon className="mb-4 w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
        <CardHeader className="p-0">
          <CardTitle className="text-lg mb-1 group-hover:text-primary">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
