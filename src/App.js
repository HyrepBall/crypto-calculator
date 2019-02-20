import React, {Component} from 'react';
import 'antd/dist/antd.css';

import { ActionsTable } from 'components/ActionsTable/ActionsTable';

export default class App extends Component {

	render() {
		return(
			<div className="App">
				<ActionsTable />
			</div>
		)
	}
}