import Customer from '../Customer';
import Address from '../Address';
import { ProcessorItem, ProcessorItemState } from '../ProcessorItem';

export default class Processor {
    gateway: Object;

    constructor(gateway:Object) {
        this.gateway = gateway;
    }

    persistProcessorItem(item:ProcessorItem) {
        if (item.processor.state === ProcessorItemState.Initial) {
            this.gateway
        }
    }

    persistAddress(customer:Customer, address:Address) {
        if (address.processor.state === ProcessorItemState.Initial) {
        }
    }

    persistCustomer()

    persist(customer:Customer) {
        persistCustomer(customer)
            .then((customer:Customer) => {

                return Promise.all(customer.addresses)
            })
    }
}
