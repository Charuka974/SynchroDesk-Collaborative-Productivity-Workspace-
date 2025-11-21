import { Link } from "react-router-dom"

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-linear-to-br from-purple-100 to-purple-300">
      <h1 className="text-5xl font-bold mb-4 text-gray-800">
        Welcome GDSE 72!
      </h1>
      <p className="text-lg mb-8 text-gray-700 text-center max-w-md">
        This is your Rapid Application Development (RAD) demo. Navigate to login
        or register to continue.
      </p> 

      <div className="flex gap-6">
        <Link
          to="/login"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Register
        </Link>
      </div>

      <p className="mt-12 text-sm text-gray-600">
        RAD GDSE 72 | React + Tailwind Demo
      </p>
    </div>
  )
}
