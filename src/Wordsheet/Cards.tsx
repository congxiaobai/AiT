import React, { useEffect } from "react";
import { Card, CardFooter, Button, Switch, Input, TableBody, Spinner, TableRow, TableCell, Pagination, SortDescriptor, CardBody, CardHeader } from "@nextui-org/react";

export default (props) => {
  const { word, lines } = props;
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="max-w-60"
    >
      <CardHeader>
        <h2>{word}</h2>
      </CardHeader>
      <CardBody>
        {
          lines.map((line: string, index: number) => {
            return (
              <div key={index}>{line}</div>
            )
          })
        }

      </CardBody>

    </Card>
  );
}
