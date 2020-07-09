import React from 'react'
import { Message } from 'semantic-ui-react'
import _ from 'lodash';

const ErrorBox = ({ errors }) => (
    <React.Fragment>
        {
            !_.isEmpty(errors) && (
                <Message style={{ textAlign: 'left' }} error>
                    <Message.Header>Errors</Message.Header>
                    <Message.List>
                        {
                            Object.keys(errors).map((errorKey, index) => (
                                <Message.Item key={errorKey}>
                                    {errors[errorKey]}
                                </Message.Item>
                            ))
                        }
                    </Message.List>
                </Message>
            )
        }
    </React.Fragment>
)

export default ErrorBox