import Card from "@/components/Cards/Card/Card";

// "Upcoming Releases" rail — calendar entries scraped from AnimeIDHentai's
// upcoming page. Items are unreleased, so cards render as Coming Soon.
const Upcoming = ({ data }) => {
  const results = data?.results || [];
  if (!results.length) return null;

  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 mt-12">
      <h1 className="text-[#ffffffbd] font-medium text-2xl font-['poppins']">| Upcoming Releases</h1>

      <div className="mt-8 grid grid-auto-fit gap-3">
        {results.map((item, index) => <Card data={item} key={item.id || index} />)}
      </div>
    </div>
  )
}

export default Upcoming
