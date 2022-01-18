import React, { useContext, useState, useEffect } from 'react'
import {
	Table,
	Input,
	Popconfirm,
	Form,
	Tooltip,
	Select,
	DatePicker,
	TimePicker,
	Button,
	InputNumber,
} from 'antd'
import moment from 'moment'

const budget = [
	{
		key: '0',
		name: 'flower',
		budget: '32',
		desc: moment('2021-08-27'),
		age: 18,
		rules: 1,
	},
	{
		key: '1',
		name: 'ball',
		budget: '32',
		desc: moment('2021-08-17'),
		age: 19,
		rules: '1',
	},
]

const EditableContext = React.createContext(null)

const EditableRow = ({ index, ...props }) => {
	const [form] = Form.useForm()
	return (
		<Form form={form} component={false}>
			<EditableContext.Provider value={form}>
				<tr {...props} />
			</EditableContext.Provider>
		</Form>
	)
}

const EditableCell = ({
	title,
	editable,
	children,
	dataIndex,
	record,
	rules,
	handleSave,
	valueType,
	...restProps
}) => {
	const form = useContext(EditableContext)
	useEffect(() => {
		if (form) {
			form.setFieldsValue({
				[dataIndex]: record?.[dataIndex],
			})
		}
	}, [form, dataIndex, record])

	const save = async () => {
		try {
			const values = await form.validateFields()
			handleSave({ ...record, ...values })
		} catch (errInfo) {
			console.log('Save failed:', errInfo)
		}
	}
	const onChange = (value) => {
		if (value == 2) {
			record.rulesType = true
		} else {
			record.rulesType = false
		}
	}

	// 这里可以自行扩展
	const renderNode = (Type, name) => {
		switch (Type) {
			case 'input':
				return <Input onPressEnter={save} onBlur={save} />
			case 'select':
				if (name == 'rules') {
					return (
						<Select onBlur={save} onChange={onChange}>
							<Select.Option key="1" value={1}>
								0位小数
							</Select.Option>
							<Select.Option key="2" value={2}>
								1位小数
							</Select.Option>
						</Select>
					)
				} else {
					return (
						<Select allowClear onBlur={save}>
							<Select.Option key="1" value={1}>
								1
							</Select.Option>
							<Select.Option key="2" value={2}>
								2
							</Select.Option>
						</Select>
					)
				}

			case 'date':
				return <DatePicker onBlur={save} />
			case 'dateRange':
				return <DatePicker.RangePicker onBlur={save} />
			case 'time':
				return <TimePicker onBlur={save} />
			case 'number':
				return (
					<InputNumber
						disabled={record.rulesType ? true : false}
						onPressEnter={save}
						controls={false}
						onBlur={save}
					/>
				)
			default:
				break
		}
	}
	let childNode = valueType ? (
		<Form.Item
			style={{
				margin: 0,
			}}
			name={dataIndex}
			rules={
				rules || [
					{
						required: true,
						message: `${title} 不能为空.`,
					},
				]
			}
		>
			{renderNode(valueType, dataIndex)}
		</Form.Item>
	) : (
		children
	)
	return <td {...restProps}>{childNode}</td>
}

export function Table() {
	const [dataSource, setDataSource] = useState(budget)
	const columns = [
		{
			title: 'name',
			dataIndex: 'name',
			width: '30%',
			editable: true,
			valueType: 'select',
			rules: [{ required: true, message: '测试' }],
		},
		{
			title: 'budget',
			dataIndex: 'budget',
			editable: true,
			valueType: 'input',
		},
		{
			title: 'describe',
			dataIndex: 'desc',
			editable: true,
			valueType: 'date',
		},
		{
			title: 'age',
			dataIndex: 'age',
			editable: true,
			valueType: 'number',
		},
		{
			title: '规则',
			dataIndex: 'rules',
			editable: true,
			valueType: 'select',
		},
		{
			title: 'operation',
			dataIndex: 'operation',
			render: (_, record) =>
				dataSource.length >= 1 ? (
					<Tooltip placement="bottom" title="删除当前行">
						<Popconfirm
							title="确认删除?"
							onConfirm={() => handleDelete(record.key)}
						>
							<a>link</a>
						</Popconfirm>
					</Tooltip>
				) : null,
		},
	]

	const handleDelete = (key) => {
		setDataSource(dataSource.filter((item) => item.key !== key))
	}

	const handleAdd = () => {
		const newData = {
			key: new Date().getTime(),
			name: '-',
			budget: '-',
			desc: '',
		}
		setDataSource([...dataSource, newData])
	}

	const handleSave = (row) => {
		console.log(row, 'row')
		const newData = [...dataSource]
		const index = newData.findIndex((item) => row.key === item.key)
		const item = newData[index]
		newData.splice(index, 1, { ...item, ...row })
		console.log(newData, 'newDaat')
		setDataSource(newData)
	}

	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	}

	const newColumns = columns.map((col) => {
		if (!col.editable) {
			return col
		}
		return {
			...col,
			onCell: (record) => ({
				record,
				editable: col.editable,
				dataIndex: col.dataIndex,
				title: col.title,
				valueType: col.valueType,
				rules: col.rules,
				handleSave: handleSave,
			}),
		}
	})

	return (
		<div>
			<Table
				components={components}
				rowKey={(record) => record.key}
				bordered
				pagination={false}
				dataSource={dataSource}
				columns={newColumns}
			/>
			<Button type="primary" onClick={handleAdd}>
				添加
			</Button>
		</div>
	)
}
