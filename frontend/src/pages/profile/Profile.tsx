import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { fetchApi } from '../../services/api'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  
  useEffect(() => {
    fetchApi('/profile').then(setProfile).catch(console.error)
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Learner Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">User ID</label>
              <div className="font-medium text-lg">{profile?.user_id || 'mock-user-123'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Onboarding Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Experience Level</label>
              <div className="font-medium">{profile?.experience_level}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                {profile?.onboarding_status}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
