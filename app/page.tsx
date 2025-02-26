import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TruckIcon, UsersIcon, ClipboardListIcon, LineChartIcon } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold">Gestion des Camions de Sable</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TruckIcon className="h-5 w-5" />
                <span>Camions</span>
              </CardTitle>
              <CardDescription>Gestion des camions et chauffeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/trucks">Gérer les Camions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5" />
                <span>Clients</span>
              </CardTitle>
              <CardDescription>Gestion des clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/clients">Gérer les Clients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardListIcon className="h-5 w-5" />
                <span>Transactions</span>
              </CardTitle>
              <CardDescription>Suivi des entrées et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/transactions">Voir les Transactions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChartIcon className="h-5 w-5" />
                <span>Rapports</span>
              </CardTitle>
              <CardDescription>Statistiques et analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/reports">Voir les Rapports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}