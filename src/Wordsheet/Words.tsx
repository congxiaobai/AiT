import React from "react";
import { Table, TableHeader, TableColumn, Tooltip, CardHeader, TableBody, Spinner, TableRow, TableCell, Pagination, Button } from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { users } from "./data";
import { DeleteIcon } from './Icon'
export default () => {
    const [page, setPage] = React.useState(1);
    const [dataSource, setDataSource] = React.useState(users);
    const rowsPerPage = 10;
    const [isLoading, setIsLoading] = React.useState(false);
    const renderCell = React.useCallback((rowData, columnKey) => {
        const cellValue = rowData[columnKey];
        if (columnKey === 'actions') {
            return <Button color="danger" isIconOnly>

                <DeleteIcon />

            </Button>
        }
        return cellValue;
    }, [])
    const pages = Math.ceil(dataSource.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return dataSource.slice(start, end);
    }, [page, dataSource]);

    let list = useAsyncList({
        async load() {
            return {
                items: items,
            };
        },
        async sort({ items, sortDescriptor }) {
            return {
                items: items.sort((a, b) => {
                    let first = a[sortDescriptor.column];
                    let second = b[sortDescriptor.column];
                    let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }
                    return cmp;
                }),
            };
        },
    });
    return (
        <div className="p-4">

            <div className="flex gap-2">
                <Button color="primary">刷新</Button>
                <Button color="success">导出为excel</Button>
            </div>

            <Table
                aria-label="Example table with client side pagination"
                sortDescriptor={list.sortDescriptor}
                onSortChange={list.sort}
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="secondary"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }
                classNames={{
                    wrapper: "min-h-[222px]",
                }}
            >
                <TableHeader>
                    <TableColumn key="name" allowsSorting>单词</TableColumn>
                    <TableColumn key="role" allowsSorting>例句和释义</TableColumn>
                    <TableColumn key="role" allowsSorting>词源/帮记</TableColumn>
                    <TableColumn key="count">查询次数</TableColumn>
                    <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody items={list.items} isLoading={isLoading}
                    loadingContent={<Spinner label="Loading..." />}>
                    {(item) => (
                        <TableRow key={item.name}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
