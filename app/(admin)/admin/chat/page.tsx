import { Card, CardContent } from "@/components/ui/Card";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminChatPage() {
  const supabase = createSupabaseAdminClient();

  const { data: messages, error } = await supabase
    .from("chatbot_messages")
    .select("id,role,content,created_at, chatbot_sessions(id,session_id,user_id)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  type Row = {
    id: string;
    role: string;
    content: string;
    created_at: string;
    chatbot_sessions: { session_id: string; user_id: string | null } | null;
  };
  const typed = (messages ?? []) as Row[];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Chat logs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Logged conversations from the website chatbot (MVP).
          </p>
        </CardContent>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Time</Th>
            <Th>Session</Th>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Message</Th>
          </tr>
        </thead>
        <tbody>
          {typed.map((m) => (
            <tr key={m.id}>
              <Td className="text-muted-foreground">
                {new Date(m.created_at).toLocaleString()}
              </Td>
              <Td className="text-muted-foreground">{m.chatbot_sessions?.session_id ?? "—"}</Td>
              <Td className="text-muted-foreground">{m.chatbot_sessions?.user_id ?? "—"}</Td>
              <Td className="font-medium">{m.role}</Td>
              <Td className="text-muted-foreground">{m.content}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}


