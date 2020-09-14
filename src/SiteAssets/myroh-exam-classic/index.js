class OrdersAPI {
    async sandBox() {
        const url = _spPageContextInfo.webAbsoluteUrl;
        try {
            const query = `${url}/_api/web/lists/getbytitle('Orders')/items`;
            const result = await this.getItems(query);
            this.renderHTML(result)
            console.log(result);
        } catch (err) {
            console.log(err);
        }
    }
    getItems(query) {
        return $.ajax({
            url: query,
            method: "GET",
            contentType: "application/json;odata=verbose",
            headers: {
                Accept: "application/json;odata=verbose",
            },
        });
    }

    async createData(order) {
        const url = _spPageContextInfo.webAbsoluteUrl;
        const query = `${url}/_api/web/lists/getbytitle('Orders')/items`;
        const requestDigest = await this.getRequestDigest(url);
        console.log(requestDigest.d.GetContextWebInformation.FormDigestValue);
        const listItemType = await this.getListItemType(
            url,
            "Orders"
        );
        const objType = {
            __metadata: {
                type: listItemType.d.ListItemEntityTypeFullName,
            },
        };
        console.log(objType);
        const objData = JSON.stringify(Object.assign(objType, order));

        return $.ajax({
            url: query,
            type: "POST",
            data: objData,
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest":
                    requestDigest.d.GetContextWebInformation.FormDigestValue,
                "X-HTTP-Method": "POST",
            },
        });
    }

    getRequestDigest(webUrl) {
        return $.ajax({
            url: webUrl + "/_api/contextinfo",
            method: "POST",
            headers: {
                Accept: "application/json; odata=verbose",
            },
        });
    }

    getListItemType(url, listTitle) {
        const query =
            url +
            "/_api/Web/Lists/getbytitle('" +
            listTitle +
            "')/ListItemEntityTypeFullName";
        return this.getItems(query);
    }

    renderHTML(result) {
        try {
            const orderList = result.d.results;
            let orderItems = `<div class="orderCard cardHeader">
            <div class="cardItem itemHeader">Title</div>
            <div class="cardItem itemHeader">Description</div>
            <div class="cardItem itemHeader">In Stock</div>
            <div class="cardItem itemHeader">Category</div>
        </div>`;
            orderList.map((item) => {
                const orderItem = new OrderItem(item);
                console.log(orderItem)
                orderItems += orderItem.getHtml();
            });
            document.getElementById(
                'content'
            ).innerHTML = orderItems;
        } catch (error) {
            console.log(error)
        }
    }

}

class OrderItem {
    constructor(order) {
        this.title = order.Title
        this.desc = order.Description
        this.inStock = order.inStock
        this.category = order.Category
        // this.provider = order.Provider
        // this.manager = order.Manager
    }

    getHtml() {
        let template = `<div class="orderCard">
            <div class="cardItem">${this.title}</div>
            <div class="cardItem">${this.desc}</div>
            <div class="cardItem">${this.inStock}</div>
            <div class="cardItem">${this.category}</div>
        </div>`
        return template
    }
}

SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
    const ordersAPI = new OrdersAPI();
    ordersAPI.sandBox();
    document.getElementById("addItem").addEventListener('click', async () => {
        const order = {
            Title: document.getElementById('orderTitle').value,
            Description: document.getElementById('orderDescription').value,
            inStock: document.getElementById('orderInStock').checked,
            Category: document.getElementById('orderCategory').value,
        }
        const res = await ordersAPI.createData(order)
        console.log("create", res)
        const orderItem = new OrderItem(res.d)
        const content = document.getElementById('content')
        content.innerHTML = content.innerHTML + orderItem.getHtml()
    })
});