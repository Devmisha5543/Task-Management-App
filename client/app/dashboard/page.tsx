import Button from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Your Tasks
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage your tasks and stay organized.
          </p>
        </div>

        <Button>
          Create Task
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-8">
        <p className="text-gray-500">
          Your Kanban board will appear here.
        </p>
      </div>
    </div>
  );
}