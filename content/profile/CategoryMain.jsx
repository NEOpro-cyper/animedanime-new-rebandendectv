"use client"
import { useState } from "react"
import CategorySelector from "./CategorySelector"
import Statistics from "./Statistics/Statistics"
import Movies from "./Movies"

const CategoryMain = ({ info, totalMovies, loading }) => {
  const [active, setActive] = useState("CURRENT")

  return (
    <div>
      <CategorySelector active={active} setActive={setActive} totalMovies={totalMovies} />
      {active !== "STATISTICS" ?
        <Movies active={active} totalMovies={totalMovies} />
        :
        <Statistics />}
    </div>
  )
}

export default CategoryMain