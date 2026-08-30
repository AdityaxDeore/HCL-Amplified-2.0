import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { fetchApi } from '../../services/api'

export default function Preferences() {
  const [profile, setProfile] = useState<any>(null)
  
  useEffect(() => {
    fetchApi('/profile').then(setProfile).catch(console.error)
  }, [])
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Preferences & Availability</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(profile?.learning_preferences, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(profile?.availability, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
