import Link from "next/link";
import { Calendar, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { DeleteRiddleButton } from "@/components/admin/delete-riddle-button";
import type { AdminRiddleRow } from "@/lib/admin-riddles";

type RiddleListTableProps = {
  riddles: AdminRiddleRow[];
  todayIso: string;
};

export function RiddleListTable({ riddles, todayIso }: RiddleListTableProps) {
  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle>All riddles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Release</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Answer (normalized)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riddles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No riddles yet.{" "}
                  <Link href="/admin#new-riddle" className="font-medium text-primary underline">
                    Create one in the dashboard
                  </Link>
                  .
                </TableCell>
              </TableRow>
            ) : (
              riddles.map((riddle) => {
                const isLive = riddle.release_date <= todayIso;

                return (
                  <TableRow key={riddle.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Calendar className="size-4 text-primary" />
                        {riddle.release_date}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{riddle.title}</TableCell>
                    <TableCell>
                      {isLive ? (
                        <Badge variant="success">Live</Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate font-mono text-xs md:table-cell">
                      {riddle.correct_answer_normalized}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/riddles/${riddle.id}/edit`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </Button>
                        <DeleteRiddleButton id={riddle.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
