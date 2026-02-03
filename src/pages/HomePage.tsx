import { Navbar } from "@/components/HomePage/Navbar"
import { LeftSidebar } from "@/components/HomePage/LeftSidebar"
import { MainFeed } from "@/components/HomePage/MainFeed"
import { RightSidebar } from "@/components/HomePage/RightSidebar"

const HomePage = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="flex max-w-[1400px] mx-auto">
        <LeftSidebar />
        <MainFeed />
        <RightSidebar />
      </div>
    </div>
  )
}

export default HomePage
