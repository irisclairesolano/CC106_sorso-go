"use client"

import TravelTipCard from "./TravelTipCard"

export default function TravelTipCardWrapper({ tip, index }) {
  // Use index as part of the key to ensure uniqueness
  return <TravelTipCard key={`${tip.id || tip.title}-${index}`} tip={tip} />
}
