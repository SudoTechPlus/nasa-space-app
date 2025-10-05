/* eslint-disable react/no-unescaped-entities */
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Satellite,
  Globe,
  Shield,
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Play,
  BarChart3,
  Heart,
  Cloud,
  BriefcaseMedical,
  Check,
  Calculator
} from "lucide-react"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import Footer from "./footer"

export default function TEMPOLandingPage() {
  const quickActions = [
    {
      title: "View Current Air Quality",
      description: "Real-time AQI and pollution levels in your area",
      icon: Eye,
      href: "/trends",
      color: "bg-red-50 text-red-600 border-red-200"
    },
    {
      title: "Check Health Risks",
      description: "Personalized health recommendations based on air quality",
      icon: Heart,
      href: "/health",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      title: "Get Estimate Cost",
      description: "Get estimation cost for specific health risk.",
      icon: Calculator,
      href: "/health#estimate",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      title: "City Rankings",
      description: "See which cities have the best and worst air quality",
      icon: BarChart3,
      href: "/trends#rankings",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      title: "Pollution Map",
      description: "Interactive map showing global air quality data",
      icon: MapPin,
      href: "/pollution-map",
      color: "bg-orange-50 text-orange-600 border-orange-200"
    }
  ]

  const features = [
    {
      icon: Satellite,
      title: "Space-Based Monitoring",
      description: "TEMPO provides unprecedented resolution from geostationary orbit, monitoring air quality every hour across North America."
    },
    {
      icon: Globe,
      title: "Continental Coverage",
      description: "Monitor air pollution patterns across entire continents, tracking how pollutants move and transform in the atmosphere."
    },
    {
      icon: Shield,
      title: "Public Health Protection",
      description: "Early warning system for pollution events helps protect vulnerable populations and inform public health decisions."
    },
    {
      icon: TrendingUp,
      title: "Climate Insights",
      description: "Track greenhouse gases and pollutants that contribute to climate change, supporting environmental policy decisions."
    }
  ]

  const benefits = [
    {
      icon: Users,
      title: "For Everyone",
      items: [
        "Real-time air quality alerts",
        "Personalized health recommendations",
        "Daily activity planning guidance",
        "Protective measure suggestions"
      ]
    },
    {
      icon: BriefcaseMedical,
      title: "For Healthcare",
      items: [
        "Early warning for asthma risks",
        "Population health analytics",
        "Environmental health data",
        "Public health planning tools"
      ]
    },
    {
      icon: Cloud,
      title: "For Environment",
      items: [
        "Pollution source tracking",
        "Climate change monitoring",
        "Environmental compliance",
        "Emission reduction verification"
      ]
    }
  ]

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Monitor Air Quality from
                <span className="bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent"> Space</span>
              </h1>
              
              <p className="text-xl font-thin max-w-2xl">
                TEMPO provides revolutionary air quality monitoring from geostationary orbit, 
                delivering unprecedented insights into pollution patterns and health impacts 
                across North America.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="#mission">
                    <Play className="h-4 w-4" />
                    Learn About TEMPO
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">Hourly</div>
                  <div className="text-sm font-thin">Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Continental</div>
                  <div className="text-sm font-thin">Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Real-time</div>
                  <div className="text-sm font-thin">Alerts</div>
                </div>
              </div>
            </div>

            {/* Window */}
            <div className="relative">
              <div className="rounded-2xl p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Air Quality Monitoring</h3>
                    <p className="text-sm">Powered by NASA TEMPO</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="/10 rounded-lg p-4 border">
                    <span className="flex items-start justify-between">
                      <div className="text-4xl font-bold">42</div>
                      <Badge className="text-xs bg-green-600">Good</Badge>
                    </span>
                    <div className="text-sm">Current AQI</div>
                  </div>
                  <div className="/10 rounded-lg p-4 border">
                    <span className="flex items-start justify-between">
                      <div className="text-4xl font-bold">12.3</div>
                      <Badge className="text-xs bg-green-600">Safe</Badge>
                    </span>
                    <div className="text-sm">PM2.5 μg/m³</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Health Recommendation</span>
                    <span className="text-green-300">✓ Ideal</span>
                  </div>
                  <p className="text-sm font-thin">
                    Air quality is excellent for all outdoor activities. No health precautions needed.
                  </p>
                </div>

                <Button className="w-full">
                  Explore Forecast and Trends
                </Button>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4  rounded-xl p-4 shadow-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 flex justify-center">
            <h1 className="text-3xl lg:text-4xl w-2/3 text-center font-bold mb-4">
              Get immediate insights into air quality and health impacts with our powerful tools.
            </h1>
          </div>

          <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto ">
            {quickActions.map((action, index) => (
              <BentoCard 
                key={index}
                name={action.title}
                description={action.description}
                href={action.href}
                cta="Explore"
                Icon={action.icon}
                background={null}
                className="col-span-1"
              />
            ))}
          </BentoGrid>

        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Transforming Air Quality Monitoring from Space
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-100/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Satellite className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
                    <p className="font-thin text-xl">
                      To provide revolutionary air quality data from geostationary orbit, 
                      enabling hourly monitoring of major pollutants across North America 
                      and empowering communities to make informed health decisions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl mb-2">Our Vision</h3>
                    <p className="font-thin text-xl">
                      A world where everyone has access to real-time, accurate air quality 
                      information to protect their health and contribute to cleaner 
                      environments for future generations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/trends">
                    Explore Trends
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="https://nasa.gov/tempo" target="_blank">
                    NASA TEMPO Site
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl p-8 shadow-xl border">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-center">Why TEMPO Matters</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50/10 rounded-xl">
                      <Calendar className="h-8 w-8" />
                      <div>
                        <div className="font-semibold">Hourly Updates</div>
                        <div className="text-sm font-thin">Not just daily snapshots</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50/10 rounded-xl">
                      <MapPin className="h-8 w-8" />
                      <div>
                        <div className="font-semibold">Neighborhood Level</div>
                        <div className="text-sm font-thin">High spatial resolution</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50/10 rounded-xl">
                      <Shield className="h-8 w-8" />
                      <div>
                        <div className="font-semibold">Health Protection</div>
                        <div className="text-sm font-thin">Early warning system</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is TEMPO */}
      <section id="features" className="py-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What is TEMPO?
            </h2>
            <p className="text-xl font-thin max-w-3xl mx-auto">
              TEMPO (Tropospheric Emissions: Monitoring of Pollution) is NASA's first Earth-venture 
              instrument that will monitor major air pollutants across North America from space.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-100/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-red-600/80" />
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="font-thin">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8 ">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Revolutionary Technology</h3>
                <p className="font-thin mb-6">
                  TEMPO's advanced spectrometer measures sunlight reflected and scattered 
                  from Earth's surface and atmosphere to determine air pollutant concentrations 
                  with unprecedented accuracy and frequency.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500/70 rounded-full"></div>
                    <span>Measures ozone, nitrogen dioxide, and other pollutants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500/70 rounded-full"></div>
                    <span>Geostationary orbit for continuous monitoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500/70 rounded-full"></div>
                    <span>High-resolution data down to neighborhood level</span>
                  </li>
                </ul>
              </div>
              <div className="/10 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Key Capabilities</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-red-300 font-bold">Hourly</div>
                    <div className="font-thin">Frequency</div>
                  </div>
                  <div>
                    <div className="text-red-300 font-bold">North America</div>
                    <div className="font-thin">Coverage</div>
                  </div>
                  <div>
                    <div className="text-red-300 font-bold">~10 sq km</div>
                    <div className="font-thin">Resolution</div>
                  </div>
                  <div>
                    <div className="text-red-300 font-bold">O₃, NO₂, SO₂, H₂CO</div>
                    <div className="font-thin">Pollutants</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Who Benefits from TEMPO?
            </h2>
            <p className="text-xl font-thin max-w-2xl mx-auto">
              TEMPO's revolutionary data serves diverse communities and applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="font-thin">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20  ">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Explore Air Quality Data?
          </h2>
          <p className="text-xl text-red-900 dark:text-red-100 max-w-2xl mx-auto mb-8">
            Join thousands of users who are already using TEMPO data to make informed decisions about their health and activities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="  hover:bg-red-50">
              <Link href="/dashboard">
                Explore Health Risky Insights
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white  hover:/10">
              <Link href="https://nasa.gov/tempo" target="_blank">
                Learn More About TEMPO
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}