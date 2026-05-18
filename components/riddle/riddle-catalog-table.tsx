import Link from "next/link";
import { Calendar, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CatalogRiddleRow } from "@/lib/riddles-catalog";

type RiddleCatalogTableProps = {
  riddles: CatalogRiddleRow[];
  todayIso: string;
};

export function RiddleCatalogTable({ riddles, todayIso }: RiddleCatalogTableProps) {
  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle>Released riddles</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="w-full min-w-0 overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Release</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riddles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No released riddles yet. Check back after your teacher publishes one.
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
                    <TableCell className="text-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/riddles/${riddle.id}`}>
                          <Eye className="size-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
