import React from 'react';
import Alert from "./Alert";
import {Button, Col, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Table} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardCheck, faBoxes, faTimes, faUser} from "@fortawesome/free-solid-svg-icons";
import {Redirect} from "react-router-dom";

export default class Order extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            itemId: "",
            quantity: 0,
            orderItems: [],
            total: 0,
            alert: false,
            alertText: null
        };
    }

    componentDidMount() {
        document.title = "PS | Order";
        fetch('http://localhost:5000/api/item')
            .then(response => response.json())
            .then(result => this.setState({items: result.items}, () => {
                this.setState({
                    itemId: this.state.items[0]._id
                })
            }))
            .catch(err => console.log(err))
    }

    resetAlert = () => {
        this.setState({
            alert: false,
            alertText: null
        });
    };

    addItem = async () => {
        const item = await this.state.items.filter(item => item._id === this.state.itemId)[0];
        item.orderQuantity = this.state.quantity;
        this.setState({orderItems: this.state.orderItems.concat(item)}, () => {
            this.state.orderItems.forEach(item => this.setState({total: this.state.total + (item.orderQuantity * item.unitPrice)}));
        });
    };

    order = event => {

        event.preventDefault();

        const packet = {
            method: 'POST',
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: this.state.total > 100000 ? 'PENDING' : 'APPROVED',
                estimatedTotal: this.state.total,
                items: this.state.orderItems,
                siteManager: this.props.session.user
            })
        };

        fetch('http://localhost:5000/api/order', packet)
            .then(response => response.json())
            .then(result => {if (result.msg) this.setState({alert: true, alertText: result.msg})})
            .catch(err => console.log(err));

    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {

        if (!this.props.session.isAuthenticated) return <Redirect to="/"/>;

        let alert = "";
        if (this.state.alert)
            alert = <Alert alertText={this.state.alertText} resetAlert={this.resetAlert}/>;

        return (
            <div className="container-fluid row mx-0">
                <Col md={6} className="container-fluid text-center">
          <span>
            <h1 className="mt-4 mb-4 text-success">
              <FontAwesomeIcon icon={faBoxes}/>
                &ensp;Add Items
            </h1>
            <hr/>
            <div className="row">
                <Col md={6} className="mb-0">
                                    <FormGroup className="text-left">
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText className="adTextBox">
                                                    <FontAwesomeIcon icon={faUser}/>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                value={this.state.itemId}
                                                onChange={this.handleChange}
                                                className="select"
                                                type="select"
                                                name="itemId"
                                            >
                                                {
                                                    this.state.items.map(item =>
                                                        <option key={item._id} value={item._id}>{item.name}</option>)
                                                }
                                            </Input>
                                        </InputGroup>
                                        <FormText className="ml-3">Please select an item</FormText>
                                    </FormGroup>
                                </Col>
                <Col md={6} className="mb-4">
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText className="adTextBox">
                                                <FontAwesomeIcon icon={faUser}/>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            autoComplete="off"
                                            required
                                            value={this.state.quantity}
                                            onChange={this.handleChange}
                                            className="textBox"
                                            type="number"
                                            name="quantity"
                                            placeholder="Quantity"
                                        />
                                    </InputGroup>
                                </Col>
            </div>
              <div className="row container-fluid mr-0 pr-0">
                                <Col md={12} className="mb-4 px-0 text-center">
                                    <Button className="button" onClick={this.addItem} style={{width: '100%'}}>
                                        Add
                                    </Button>
                                </Col>
                            </div>
          </span>
                </Col>
                <Col md={6} className="container-fluid text-center">
                    <h1 className="mt-4 mb-4 text-success"><FontAwesomeIcon icon={faClipboardCheck}/>&ensp;Order</h1>
                    <hr/>
                    <form onSubmit={this.handleSubmit}>
                        <div className="comp pt-4 pb-3 p-2 mb-4">
                            <Table className="merchantTable text-center" striped borderless responsive>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.orderItems.map(item =>
                                        <tr key={item._id}>
                                            <td className="text-left" style={{
                                                borderBottomLeftRadius: '0.5rem',
                                                borderTopLeftRadius: '0.5rem'
                                            }}>{item.name}</td>
                                            <td>{item.orderQuantity}</td>
                                            <td style={{
                                                borderBottomRightRadius: '0.5rem',
                                                borderTopRightRadius: '0.5rem'
                                            }}>Rs. {item.orderQuantity * item.unitPrice}</td>
                                        </tr>
                                    )
                                }
                                <tr>
                                    <th className="text-left" style={{
                                        borderBottomLeftRadius: '0.5rem',
                                        borderTopLeftRadius: '0.5rem'
                                    }}>Estimated Total</th>
                                    <th> </th>
                                    <th style={{
                                        borderBottomRightRadius: '0.5rem',
                                        borderTopRightRadius: '0.5rem'
                                    }}>Rs. {this.state.total}</th>
                                </tr>
                                <tr>
                                    <td className="text-left" style={{
                                        borderBottomLeftRadius: '0.5rem',
                                        borderTopLeftRadius: '0.5rem'
                                    }}>Clear</td>
                                    <td> </td>
                                    <td style={{
                                        borderBottomRightRadius: '0.5rem',
                                        borderTopRightRadius: '0.5rem'
                                    }}>
                                        <Button className="button my-0" disabled={this.state.orderItems.length <= 0} onClick={() => this.setState({orderItems: [], total: 0})}>
                                            <FontAwesomeIcon icon={faTimes}/>
                                        </Button>
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div className="row container-fluid mr-0 pr-0">
                            <Col md={12} className="mb-4 px-0 text-center">
                                <Button className="button" disabled={this.state.orderItems.length <= 0} onClick={this.order} style={{width: '100%'}}>
                                    Order
                                </Button>
                            </Col>
                        </div>
                    </form>
                </Col>
                {alert}
            </div>
        );
    }

}