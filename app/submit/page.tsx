import SubmissionForm from '@/components/SubmissionForm'
import DashboardHeader from '@/components/DashboardHeader'

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="py-8">
        <SubmissionForm />
      </div>
    </div>
  )
}

