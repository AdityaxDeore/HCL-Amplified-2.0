import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { fetchApi } from '../../services/api'

export default function Skills() {
  const [profile, setProfile] = useState<any>(null)
  
  useEffect(() => {
    fetchApi('/profile').then(setProfile).catch(console.error)
  }, [])
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto">
            {JSON.stringify(profile?.skills, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
