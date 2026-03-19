import { Navbar } from "@/components/HomePage/Navbar"
import { Outlet } from "react-router-dom"

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default HomeLayout