import React, { useState, useEffect } from 'react'
import { Table, Select, InputNumber, Tooltip, Checkbox } from 'antd'
import { CommonSelect } from '@com/index'
const { Option } = Select

export const InsuranceTable = ({ insuranceList, setTableList }) => {
	const [tableData, setTableData] = useState([])

	useEffect(() => {
		setTableData(insuranceList)
	}, [insuranceList])

	// 下拉框
	const renderSelect = (_, record, index, field, opt, type) => {
		return (
			<>
				{(field == 'pexactDigit' || field == 'pexactStrategy') &&
				record.displayFlag == 1 ? (
					<CommonSelect disabled />
				) : (
					<CommonSelect
						placeholder="请选择"
						value={record[field] ? record[field] : '01'}
						disabled={record[type] == 1 ? true : false}
						onChange={(e) => selectChange(e, record, index, field)}
					>
						{opt &&
							opt.map((item) => (
								<Option value={item.itemValue} key={item.id}>
									<Tooltip placement="topLeft" title={item.itemText}>
										{item.itemText}
									</Tooltip>
								</Option>
							))}
					</CommonSelect>
				)}
			</>
		)
	}

	// 下拉框事件
	const selectChange = (e, record, index, field) => {
		const newData = [...tableData]
		record[field] = e
		newData[index] = record
		setTableData(newData)
		setTableList(newData)
	}

	// 判断只能输入正整数
	const limitDecimals = (value) => {
		return value.replace(/^(0+)|[^\d]+/g, '')
	}
	// num输入框
	const renderInputNumber = (
		_,
		record,
		index,
		field,
		min,
		max,
		addonAfter,
		formatter,
		parser
	) => {
		return (
			<>
				{field == 'ppaymentNum' && record.displayFlag == 1 ? (
					<InputNumber value="0" disabled />
				) : (
					<InputNumber
						controls={false}
						placeholder="请输入"
						value={record[field] ? record[field] : 0}
						min={min}
						max={max}
						addonAfter={addonAfter}
						formatter={formatter}
						parser={parser}
						onChange={(value) => {
							inputNumberChange(value, record, index, field)
						}}
					/>
				)}
			</>
		)
	}

	// num输入框事件
	const inputNumberChange = (value, record, index, field) => {
		const newData = [...tableData]
		record[field] = value
		if (field === 'baseDown') {
			if (newData[index]['baseUp'] < newData[index][field]) {
				newData[index]['baseUp'] = newData[index][field]
			}
		}
		newData[index] = record
		setTableList(newData)
		setTableData(newData)
	}

	const renderInputNumberSearch = (record, field, field2) => {
		// console.log(record.ppaymentType);
		return (
			<Select
				value={record[field2] ? record[field2] : 0}
				getPopupContainer={(triggerNode) => triggerNode.parentNode}
				onChange={(value) => {
					inputNumberSearchChange(value, record, field)
				}}
			>
				<Option value={0}>%</Option>
				<Option value={1}>元</Option>
			</Select>
		)
	}

	const renderChecked = (_, record, index, field) => {
		return (
			<Checkbox
				checked={record[field] == '可' ? true : false}
				onChange={(e) => {
					checkedChange(e, record, index, field)
				}}
			/>
		)
	}

	const checkedChange = (e, record, index, field) => {
		const { checked } = e.target
		const newData = [...tableData]
		if (checked) {
			record[field] = '可'
		} else {
			record[field] = '不可'
		}
		newData[index] = record
		setTableData(newData)
		setTableList(newData)
	}

	const inputNumberSearchChange = (value, record, field) => {
		if (field == 'ppaymentNum') {
			if (value == 1) {
				// 判断下拉百分比金额类型
				record.ppaymentType = 1
			} else {
				record.ppaymentType = 0
			}
		} else if (field == 'cpaymentNum') {
			if (value == 1) {
				record.cpaymentType = 1
			} else {
				record.cpaymentType = 0
			}
		}
	}

	const columns = [
		{
			title: '险种名称',
			dataIndex: 'name',
			key: 'name',
			width: 80,
			ellipsis: true,
			render: (text) => (
				<Tooltip placement="topLeft" title={text}>
					{text}
				</Tooltip>
			),
		},
		{
			title: '基数下限',
			width: '9%',
			dataIndex: 'baseDown',
			key: 'baseDown',
			render: (text, record, index) =>
				renderInputNumber(text, record, index, 'baseDown'),
		},
		{
			title: '基数上限',
			width: '9%',
			dataIndex: 'baseUp',
			key: 'baseUp',
			render: (text, record, index) =>
				renderInputNumber(text, record, index, 'baseUp', record.xiaxian),
		},

		{
			title: '公司比例',
			dataIndex: 'cpaymentNum',
			key: 'cpaymentNum',
			className: 'table_proprtion',
			width: '10%',
			render: (text, record, index) =>
				renderInputNumber(
					text,
					record,
					index,
					'cpaymentNum',
					0,
					999999999,
					renderInputNumberSearch(record, 'cpaymentNum', 'cpaymentType')
				),
		},
		{
			title: '公司取整规则',
			dataIndex: 'cexactDigit',
			key: 'cexactDigit',
			align: 'center',
			className: 'table_header_rules',
			render: (text, record, index) => {
				return (
					<div>
						{renderSelect(
							text,
							record,
							index,
							'cexactDigit',
							record.numRuleList,
							'cpaymentType'
						)}
						{renderSelect(
							text,
							record,
							index,
							'cexactStrategy',
							record.roundRuleList,
							'cpaymentType'
						)}
					</div>
				)
			},
		},
		{
			title: '个人比例',
			dataIndex: 'ppaymentNum',
			key: 'ppaymentNum',
			width: '10%',
			className: 'table_proprtion',
			render: (text, record, index) =>
				renderInputNumber(
					text,
					record,
					index,
					'ppaymentNum',
					0,
					99999999,
					renderInputNumberSearch(record, 'ppaymentNum', 'ppaymentType')
				),
		},
		{
			title: '个人取整规则',
			dataIndex: 'pexactDigit',
			key: 'pexactDigit',
			align: 'center',
			className: 'table_header_rules',
			render: (text, record, index) => (
				<div>
					{renderSelect(
						text,
						record,
						index,
						'pexactDigit',
						record.numRuleList,
						'ppaymentType'
					)}
					{renderSelect(
						text,
						record,
						index,
						'pexactStrategy',
						record.roundRuleList,
						'ppaymentType'
					)}
				</div>
			),
		},
		{
			title: '补缴月数',
			dataIndex: 'supplementaryMonth',
			key: 'supplementaryMonth',
			width: '9%',
			render: (text, record, index) =>
				renderInputNumber(
					text,
					record,
					index,
					'supplementaryMonth',
					0,
					12,
					null,
					limitDecimals,
					limitDecimals
				),
		},
		{
			title: '可跨年',
			dataIndex: 'straddleYear',
			key: 'straddleYear',
			width: 70,
			render: (text, record, index) =>
				renderChecked(text, record, index, 'straddleYear'),
		},
	]

	return (
		<div className="insurance_table">
			<Table
				columns={columns}
				rowKey={(record, index) => index}
				dataSource={tableData}
				pagination={false}
			/>
		</div>
	)
}
