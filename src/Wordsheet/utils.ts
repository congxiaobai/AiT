
import { saveAs } from 'file-saver';
import Exceljs from 'exceljs';


// 定义表格列  
// cellType表示单元格类型，text表示普通文本，selectOption表示下拉列表
// cellStartPosition 表示当前key所在excel中单元格初始的位置
const columns = [
  {
    title: '单词',
    dataIndex: 'name',
    key: 'name',
    cellStartPosition: 'A',
  },
  {
    title: '例句和释义',
    dataIndex: 'role',
    key: 'role',
    cellStartPosition: 'B',
  },
  {
    title: '查询次数',
    dataIndex: 'count',
    key: 'count',
    cellStartPosition: 'C',
  }
];
// 获取导出的excel的列配置
const getExcelColumns = () => {
  return columns.map((item) => {
    let items = {
      header: item.title,
      key: item.dataIndex,
      width:50,
      style: {

        alignment: {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'center',
        },
      },
    };

    return items;
  });
};

// 导出excel
export const exportToExcel = (dataSource:any) => {
  const workbook = new Exceljs.Workbook();
  //创建一个名字为Sheet1的工作表
  const worksheet = workbook.addWorksheet('Sheet1');
  // worksheet.properties.defaultRowHeight = 15; // 设置默认行高
  worksheet.columns = getExcelColumns();
  worksheet.addRows(dataSource);

  workbook.xlsx.writeBuffer().then((buffer) => {
    let blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, '单词.xlsx');
  });
};

