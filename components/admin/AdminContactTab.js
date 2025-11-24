"use client"

import { useState, useEffect } from "react"
import { getAllContactMessages, deleteContactMessage } from "@/app/actions/admin-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Mail, User, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function normalizeAttachments(attachments) {
  if (!attachments) return []
  if (Array.isArray(attachments)) return attachments
  try {
    const parsed = JSON.parse(attachments)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

export default function AdminContactTab() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    const data = await getAllContactMessages()
    setMessages(data)
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    const result = await deleteContactMessage(id)
    if (result.success) {
      toast({
        title: "Message deleted",
        description: "The contact message has been permanently deleted.",
      })
      loadMessages()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete message.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading contact messages...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Contact Messages</h2>
        <Badge variant="secondary">{messages.length} messages</Badge>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No contact messages found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.contact_id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{message.name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {message.email}
                        </a>
                      </div>
                      {message.subject && (
                        <div className="text-sm font-medium text-foreground">{message.subject}</div>
                      )}
                      {message.created_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(message.contact_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                  {message.message && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.message}</p>
                    </div>
                  )}
                  {normalizeAttachments(message.attachments).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {normalizeAttachments(message.attachments).map((fileUrl, index) => (
                          <a
                            key={`${message.contact_id}-attachment-${index}`}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary underline break-all"
                          >
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

