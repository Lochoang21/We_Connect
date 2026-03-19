import { LeftSidebar } from "@/components/HomePage/LeftSidebar"
import { MainFeed } from "@/components/HomePage/MainFeed"
import { RightSidebar } from "@/components/HomePage/RightSidebar"

const HomePage = () => {
  return (
    <div className="flex max-w-[1400px] mx-auto">
      <LeftSidebar />
      <MainFeed />
      <RightSidebar />
    </div>
  )
}

export default HomePage
