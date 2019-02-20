import React, {Component} from 'react';
import { Table,  } from 'antd';
import _ from 'lodash';
import moment from 'moment';

import fakeArray, { apiArray } from 'const/fakeData';
import './ActionsTable.css';

const { Column } = Table;
const red = "#F39981";
const green = '#90D6A4';

export class ActionsTable extends Component {

	state = {
		totalTradesArray: [],
		loading: true,
	}

	componentDidMount() {
		const sortedByCurrencyObj = _.groupBy(apiArray, o => o.symbol);

		const sortedByCurrencyArray = Object.keys(sortedByCurrencyObj).map(function(key, index) {
			let tradesArray = [];

		  const groupByTrades = sortedByCurrencyObj[key].reduce(( accumulator, currentOperation, index) => {
				if (index === 0) {
					// set negative value to orderQty if first side === sell
					if (currentOperation.side.toLowerCase() === 'sell' ) {
						return {
							currencyType: currentOperation.symbol,
							zeroToCloseTrade: - currentOperation.orderQty,
		  				currencyArray: [{
								...currentOperation,
								orderQty: - currentOperation.orderQty
							}]
						}
					}

					return {
						currencyType: currentOperation.symbol,
						zeroToCloseTrade: currentOperation.orderQty,
		  			currencyArray: [currentOperation]
					}
				}

				if (index > 0) {
					let zeroToCloseTrade;
					if (currentOperation.side.toLowerCase() === 'buy') {
						zeroToCloseTrade = accumulator.zeroToCloseTrade + currentOperation.orderQty;
					}
					else {
						zeroToCloseTrade = accumulator.zeroToCloseTrade - currentOperation.orderQty;
					}
					if (zeroToCloseTrade !== 0) {
						return {
							...accumulator,
							zeroToCloseTrade,
							currencyArray: [...accumulator.currencyArray, currentOperation]
						}
					} else 
					// Finish mapping. Defined ZERO value. Trade closed.
					if (zeroToCloseTrade === 0) {
						tradesArray = [...accumulator.currencyArray, currentOperation]
						return {
							...accumulator,
							zeroToCloseTrade,
							currencyArray: [...accumulator.currencyArray, currentOperation]
						}
					}
				}
		  }, {});

			return {
			 	id: `trade_${index}`,
			 	title: `Trade #${index}`,
			 	operations: tradesArray
			}

		});

		const totalTradesArray = sortedByCurrencyArray.filter(currencyArray => currencyArray.operations.length > 0);

		this.setState({
			totalTradesArray,
			loading: false
		})

	}

	renderColumns() {
		const columns = [
			{
			  title: 'Title',
			  dataIndex: 'title',
			  key: 'title',
			  width: 150,
			},
			{
			  title: 'Operations count',
			  key: 'operationsCount',
			  render: record => { return record.operations.length },
			},
		];
		return columns;
	}

	render() {
		const { totalTradesArray, loading } = this.state;

		return(
			<div>
				<Table 
					className="ActionsTable"
					size="small"
					pagination={false}
					loading={loading}
					columns={this.renderColumns()} 
					rowKey={record => record.id}
					dataSource={totalTradesArray} 
					expandedRowRender={record => (
						<Table
							className="ActionsTable--expandable"
							size="small"
							pagination={false}
							rowKey={record => record.orderID}
							dataSource={record.operations} 
						>
							<Column
								title='Time'
							  key='expTime'
							  render={record => moment(record.timestamp).format('MMM DD YYYY, h:mm:ss A') }
							  width={180}
							/>
							<Column
								title='Symbol'
							  dataIndex='symbol'
							  key='expSymbol'
							  width={120}
							/>
							<Column
								title='Exec Type'
							  dataIndex='execType'
							  key='expExecType'
							/>
							<Column
								title='Side'
							  key='expSide'
							  render={(record) => {
							  	let color;
							  	record.side === 'Buy'
							  	? color = green
							  	: color = red

							  	return <span style={{color}}>{record.side}</span>
							  }}
							/>
							<Column
								title='Exec Qty'
							  key='exporderQty'
							  render={(record) => {
							  	let color;

							  	record.side === 'Buy'
							  	? color = green
							  	: color = red

							  	return <span style={{color}}>{Math.abs(record.orderQty)}</span>
							  }}
							/>
							<Column
								title='Exec Price'
							  dataIndex='price'
							  key='expExecPrice'
							/>
							<Column
								title='Value'
							  dataIndex='value'
							  key='expValue'
							/>
							<Column
								title='Order ID'
							  key='expOrderID'
							  render={record => (record.orderID.substring(0,8))}
							/>
						</Table>
					)}
				/>
			</div>
		)
	}
}