import React, { useEffect, useMemo } from "react";
import { Table, TableHeader, TableColumn, Switch, Input, TableBody, Spinner, TableRow, TableCell, Pagination, Button, SortDescriptor } from "@nextui-org/react";
import { DeleteIcon } from './Icon'
import { exportToExcel } from "./utils";
import { orderBy } from "lodash";
import Cards from "./Cards";
import { WordType } from "./WordType";
export default () => {
    const [page, setPage] = React.useState(1);
    const [wordCard, setWordCard] = React.useState(false);
    const [params, setParams] = React.useState({
        word: '',
        line: ''
    });
    const ref = React.useRef<WordType[]>([]);
    const [dataSource, setDataSource] = React.useState<WordType[]>([]);
    const [sortDescriptor, sesortDescriptor] = React.useState<SortDescriptor>();
    const [isLoading, setIsLoading] = React.useState(false);


    useEffect(() => {
        chrome.storage.local.get(null, function (items) {
            if (chrome.runtime.lastError) {
                console.error('Error getting items: ' + chrome.runtime.lastError);
            } else {
                let filteredItems: any = [];

                for (let key in items) {
                    if (key.startsWith('*word*') && items[key].word) {
                        filteredItems.push(items[key]);
                    }
                }
                // 现在filteredItems只包含符合条件的键值对
                ref.current = filteredItems;
                setDataSource(filteredItems)
            }
        });
    }, [])
    const deleteRow = (rowData: WordType) => {
        let newData = ref.current.filter((data) => data.word !== rowData.word);
        refreshData(newData)
    };
    const refreshData = (newData: WordType[]) => {
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
            newData = orderBy(newData, [sortDescriptor.column], [order as any]) as any
        }
        ref.current = newData

        setDataSource(newData as any)
    }
    const renderCell = React.useCallback((rowData: WordType, columnKey: keyof WordType & 'actions') => {
        const cellValue = rowData[columnKey];
        if (columnKey === 'actions') {
            return <Button color="danger" isIconOnly onClick={() => deleteRow(rowData)}>

                <DeleteIcon />

            </Button>
        }
        if (columnKey === 'lines' && cellValue) {
            return (cellValue as string[]).join('\n')
        }
        return cellValue;
    }, [])
    const rowsPerPage = useMemo(() => {
        return wordCard ? 1 : 10;
    }, [wordCard])

    const pages = useMemo(() => {
        return Math.ceil(dataSource.length / rowsPerPage);
    }, [dataSource, rowsPerPage])

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return dataSource.slice(start, end);
    }, [page, dataSource, rowsPerPage]);

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
    const changeRow = (rowData: WordType) => {
        let dataindex = ref.current.findIndex((data) => data.word === rowData.word);
        if (dataindex > -1) {
            ref.current[dataindex] = rowData;
        }
        let sourceindex = dataSource.findIndex((data) => data.word === rowData.word);
        if (sourceindex > -1) {
            dataSource[sourceindex] = rowData;
            setDataSource([...dataSource])
        }
    }
    return (
        <div className="p-4 flex gap-2 flex-col">

            <div className="flex gap-2">
                <Input onClear={() => setParams({ ...params, word: '' })} isClearable className="max-w-64" value={params.word} onChange={e => setParams({ ...params, word: e.target.value })} label='搜单词' labelPlacement="outside-left"></Input>
                <Input isClearable onClear={() => setParams({ ...params, line: '' })} className="max-w-64" value={params.line} onChange={e => setParams({ ...params, line: e.target.value })} label='搜例句' labelPlacement="outside-left"></Input>
                <Button color="primary" onClick={onSearch}>搜索</Button>
                <Button color="success" onClick={exportExcel}>导出为excel</Button>
                <Switch
                    checked={wordCard}
                    onChange={(e) => setWordCard(e.target.checked)}
                    color="secondary"
                >
                    {wordCard ? '切换到表模式' : '切换到单词卡模式'}
                </Switch>
            </div>
            {wordCard ?
                <div className="flex justify-center items-center gap-4  mt-40 flex-col flex-grow-0 width-full">
                    {items.map((s) => <Cards key={s.word}
                        onChangData={changeRow}
                        wordSource={s.wordSource}
                        count={s.count} word={s.word} lines={s.lines} translated={s.translated} />)}

                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="secondary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                    />

                </div> :
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
                </Table>}
        </div>
    );
}
