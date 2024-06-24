import React, { useEffect } from "react";
import { Table, TableHeader, TableColumn, Input, TableBody, Spinner, TableRow, TableCell, Pagination, Button, SortDescriptor } from "@nextui-org/react";
import { DeleteIcon } from './Icon'
import { exportToExcel } from "./utils";
import { orderBy } from "lodash";
export default () => {
    const [page, setPage] = React.useState(1);
    const [params, setParams] = React.useState({
        word: '',
        line: ''
    });
    const ref = React.useRef();
    const [dataSource, setDataSource] = React.useState([]);
    const [sortDescriptor, sesortDescriptor] = React.useState<SortDescriptor>();
    const rowsPerPage = 10;
    const [isLoading, setIsLoading] = React.useState(false);


    useEffect(() => {
        chrome.storage.local.get(null, function (items) {
            if (chrome.runtime.lastError) {
                console.error('Error getting items: ' + chrome.runtime.lastError);
            } else {
                let filteredItems: any = [];

                for (let key in items) {
                    if (key.startsWith('*word*')) {
                        filteredItems.push(items[key]);
                    }
                }
                // 现在filteredItems只包含符合条件的键值对
                ref.current = filteredItems;
                setDataSource(filteredItems)
            }
        });
    }, [])
    const deleteRow = (rowData) => {
        let newData = ref.current.filter((data) => data.name !== rowData.name);
        ref.current = newData
        if (params.line || params.word) {
            newData = newData.filter((item: any) => {
                let filterLine = false;
                let filterWord = false;
                if (params.line) {
                    filterLine = item.role.toLowerCase().includes(params.line)
                }
                if (params.word) {
                    filterWord = item.name.toLowerCase().includes(params.word)
                }
                return filterLine || filterWord
            })
            return;
        }
        if (sortDescriptor?.direction) {
            let order = sortDescriptor.direction === 'ascending' ? 'asc' : 'desc';
            newData = orderBy(newData, [sortDescriptor.column], [order as any])
        }
        setDataSource(newData as any)
    };
    const renderCell = React.useCallback((rowData, columnKey) => {
        const cellValue = rowData[columnKey];
        if (columnKey === 'actions') {
            return <Button color="danger" isIconOnly onClick={() => deleteRow(rowData)}>

                <DeleteIcon />

            </Button>
        }
        if (columnKey === 'lines') {

            return cellValue.join('\n')
        }
        return cellValue;
    }, [])
    const pages = Math.ceil(dataSource.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return dataSource.slice(start, end);
    }, [page, dataSource]);

    const exportExcel = () => {
        exportToExcel(dataSource)
    }
    const sortChange = (descriptor: SortDescriptor) => {
        sesortDescriptor(descriptor)
        if (descriptor.direction) {
            //'ascending' | 'descending'
            let order = descriptor.direction === 'ascending' ? 'asc' : 'desc';
            const sortData = orderBy(ref.current, [descriptor.column], [order as any])
            setDataSource(sortData as any)
        }
    }
    const onSearch = () => {
        if (!params.line && !params.word) {
            setDataSource(ref.current);
            return;
        }
        const filterData = ref.current.filter((item: any) => {
            let filterLine = false;
            let filterWord = false;
            if (params.line) {
                filterLine = item.role.toLowerCase().includes(params.line)
            }
            if (params.word) {
                filterWord = item.name.toLowerCase().includes(params.word)
            }
            return filterLine || filterWord
        })
        setDataSource(filterData)
    }
    return (
        <div className="p-4 flex gap-2 flex-col">

            <div className="flex gap-2">
                <Input onClear={() => setParams({ ...params, word: '' })} isClearable className="max-w-64" value={params.word} onChange={e => setParams({ ...params, word: e.target.value })} label='搜单词' labelPlacement="outside-left"></Input>
                <Input isClearable onClear={() => setParams({ ...params, line: '' })} className="max-w-64" value={params.line} onChange={e => setParams({ ...params, line: e.target.value })} label='搜例句' labelPlacement="outside-left"></Input>
                <Button color="primary" onClick={onSearch}>搜索</Button>
                <Button color="success" onClick={exportExcel}>导出为excel</Button>
            </div>

            <Table
                aria-label="Example table with client side pagination"
                onSortChange={sortChange}
                sortDescriptor={sortDescriptor}
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
            >
                <TableHeader>
                    <TableColumn key="word" allowsSorting>单词</TableColumn>
                    <TableColumn key="lines" allowsSorting>例句和释义</TableColumn>
                    <TableColumn key="role2" allowsSorting>词源/帮记</TableColumn>
                    <TableColumn key="count">查询次数</TableColumn>
                    <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody items={items} isLoading={isLoading}
                    loadingContent={<Spinner label="Loading..." />}>
                    {(item) => (
                        <TableRow key={item.word}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
