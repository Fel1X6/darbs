<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usr'])) {
    exit('Session ended!');
}

require __DIR__ . '/vendor/autoload.php';
include __DIR__ . '/../ServerSide/cnf.php';
include __DIR__ . '/../ServerSide/core.php';

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

$bold = [
    'font' => [
        'bold' => true
    ]
];

$bold_center = [
    'font' => [
        'bold' => true,
        'size' => 14
    ],
    'alignment' => [
        'vertical' => Alignment::VERTICAL_CENTER,
        'horizontal' => Alignment::HORIZONTAL_CENTER
    ]
];

$border_all = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['argb' => '000000']
        ]
    ]
];

function p($params, $key, $default = '')
{
    return $params[$key] ?? $default;
}

function createBudgetExcel($params)
{
    global $bold, $bold_center, $border_all;

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    $row = 1;

    $sheet->mergeCells('A1:B1');
    $sheet->setCellValue('A1', 'Budget export');
    $sheet->getStyle('A1')->applyFromArray($bold_center);
    $sheet->getRowDimension(1)->setRowHeight(28);

    $row = 3;

    $sheet->setCellValue('A'.$row, 'Vessel');
    $sheet->setCellValue('B'.$row, p($params, 'vessel_name'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Rank');
    $sheet->setCellValue('B'.$row, p($params, 'rank_name'));
    $row++;

    $row++;
    $sheet->setCellValue('A'.$row, 'Main calculation fields');
    $sheet->getStyle('A'.$row)->applyFromArray($bold);
    $row++;

    $sheet->setCellValue('A'.$row, 'Required on board');
    $sheet->setCellValue('B'.$row, p($params, 'required_on_board'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Already on board');
    $sheet->setCellValue('B'.$row, p($params, 'already_on_board'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Contract months');
    $sheet->setCellValue('B'.$row, p($params, 'contract_months'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Base salary');
    $sheet->setCellValue('B'.$row, p($params, 'base_salary'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Daily rate');
    $sheet->setCellValue('B'.$row, p($params, 'daily_rate'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Working days');
    $sheet->setCellValue('B'.$row, p($params, 'working_days'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Leave pay');
    $sheet->setCellValue('B'.$row, p($params, 'leave_pay'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Employer cost');
    $sheet->setCellValue('B'.$row, p($params, 'employer_cost'));
    $row++;

    $row++;
    $sheet->setCellValue('A'.$row, 'Bonuses / deductions / currency');
    $sheet->getStyle('A'.$row)->applyFromArray($bold);
    $row++;

    $sheet->setCellValue('A'.$row, 'Bonus');
    $sheet->setCellValue('B'.$row, p($params, 'bonus'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Premium');
    $sheet->setCellValue('B'.$row, p($params, 'premium'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Overtime');
    $sheet->setCellValue('B'.$row, p($params, 'overtime'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Other additions');
    $sheet->setCellValue('B'.$row, p($params, 'other_additions'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Deductions');
    $sheet->setCellValue('B'.$row, p($params, 'deductions'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Currency');
    $sheet->setCellValue('B'.$row, p($params, 'currency'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Display currency');
    $sheet->setCellValue('B'.$row, p($params, 'display_currency'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Exchange rate');
    $sheet->setCellValue('B'.$row, p($params, 'exchange_rate_text'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Rate date');
    $sheet->setCellValue('B'.$row, p($params, 'rate_date'));
    $row++;

    $row++;
    $sheet->setCellValue('A'.$row, 'Calculation preview');
    $sheet->getStyle('A'.$row)->applyFromArray($bold);
    $row++;

    $sheet->setCellValue('A'.$row, 'Total additions');
    $sheet->setCellValue('B'.$row, p($params, 'total_additions'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Total deductions');
    $sheet->setCellValue('B'.$row, p($params, 'total_deductions'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Monthly total');
    $sheet->setCellValue('B'.$row, p($params, 'monthly_total'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Contract total');
    $sheet->setCellValue('B'.$row, p($params, 'contract_total'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Crew total');
    $sheet->setCellValue('B'.$row, p($params, 'crew_total'));
    $row++;

    $sheet->setCellValue('A'.$row, 'Preview currency');
    $sheet->setCellValue('B'.$row, p($params, 'preview_currency'));
    $row++;

    $sheet->getStyle('A3:B'.($row - 1))->applyFromArray($border_all);
    $sheet->getColumnDimension('A')->setWidth(28);
    $sheet->getColumnDimension('B')->setWidth(30);

    while (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="budget_export.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');

    unset($_SESSION['budget_excel']);
    exit;
}

if (!isset($_SESSION['budget_excel']) || !is_array($_SESSION['budget_excel'])) {
    exit('No export data');
}

createBudgetExcel($_SESSION['budget_excel']);