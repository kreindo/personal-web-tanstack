import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'

export const Route = createFileRoute('/app/santri-reports')({
  component: RouteComponent,
})


function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['santri-reports'],
    queryFn: () => fetch('/api/santri-reports').then((res) => res.json()),
  })

  if (isLoading) return <div className='py-20 flex justify-center items-center'><Loader className='w-5 h-5 animate-spin' /></div>
  if (error) return <div>Error: {error.message}</div>

  return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Santri Reports</CardTitle>
            <CardDescription>Manage your santri reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {/* {data.map((report) => (
                <li key={report.id}>{report.name}</li>
              ))} */}
            </ul>
          </CardContent>
          <CardFooter>
            <CardAction>
              
            </CardAction>
          </CardFooter>
        </Card>
      </div>
  )
}
