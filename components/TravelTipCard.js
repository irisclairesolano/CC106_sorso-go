import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export default function TravelTipCard({ tip }) {
  return (
    <Card className="bg-secondary/20 border-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
            <Lightbulb className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">{tip.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{tip.content}</p>
      </CardContent>
    </Card>
  )
}
