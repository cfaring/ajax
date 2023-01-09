class ApiService{
    create(data){
        return fetch('https://jsonplaceholder.typicode.com/posts',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(data)
        }).then((res) => res.json()).catch((e) => alert(`error message: ${e}`));
    }
    edit(data, updId){
        const id = updId;
        return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,{
            method: 'PATCH',
            body: JSON.stringify(data),
            headers:{
                'Content-type': 'application/json; charset=UTF-8',
              },
        }).then((res) => res.json()).catch((e) => alert(`error message: ${e}`));
    }
    getName(id){
        return fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((res) => res.json()).then((json) => json.username).catch((e) => alert(`error message: ${e}`));
    }
    remove(id){
        return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,{
            method:'DELETE',
        }).catch((e) => alert(`error message: ${e}`));
    }
}

class PostService{
    
    constructor(api){
        this.api = api;
        this.postsList = window.document.querySelector('.card-deck');
        this._handleRemove = this._handleRemove.bind(this);
        this.openEdit = this.openEdit.bind(this);
        this._onEdit = this._onEdit.bind(this);
        this.editModal = document.querySelector('#editModal');
        
    }
    addPost(name, title, body, id){
        this.postsList.append(this._createPost(name, title, body, id));
    }

    _createPost(name, title, body, id){
        const container = document.createElement('div');
        container.classList.add('posts__content');
        container.id = id;
        const userName = document.createElement('div');
        userName.classList.add('username');
        const nameElem = document.createElement('h3');
        nameElem.append(document.createTextNode(name));

        const info = document.createElement('div');
        info.classList.add('info');
        const titleEl = document.createElement('div');
        titleEl.classList.add('title');
        const titleHead = document.createElement('h4');
        titleHead.append(document.createTextNode(title));
        const bodyEl = document.createElement('div');
        bodyEl.classList.add('body');
        const bodyHead = document.createElement('p');
        bodyHead.append(document.createTextNode(body));

        const delContainer = document.createElement('div');
        delContainer.classList.add('delete-button')
        const delBtn = document.createElement('button');
        delBtn.append(document.createTextNode('Delete'));

        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-button')
        const editBtn = document.createElement('button');
        editBtn.append(document.createTextNode('Edit'));

        titleEl.append(titleHead);
        bodyEl.append(bodyHead);
        delContainer.append(delBtn);
        editContainer.append(editBtn);
        info.append(titleEl);
        info.append(bodyEl);
        userName.append(nameElem);

        container.append(userName);
        container.append(info);
        container.append(delContainer);
        container.append(editContainer);

        delBtn.addEventListener('click', this._handleRemove);
        editBtn.addEventListener('click', this.openEdit);

        return container;
    }

    _handleRemove(event){
        const post = event.target.parentElement.parentElement;
        this.api.remove(post.id).then((res) => {
            if(res.status >= 200 && res.status <= 300){
                event.target.removeEventListener('click',this._handleRemove);
                post.remove();
            }
        })
    }
    openEdit(e){
        this.editModal.classList.toggle('visually-hidden');
        const id = e.target.parentElement.parentElement.id;
        const elem = e.target.parentElement.parentElement;
        const editBtn = document.querySelector('.on-edit-button');
        editBtn.addEventListener('click',() => this._onEdit(e, id, elem));
        
    }
    closeEdit(){

        this.editModal.classList.toggle('visually-hidden');
    }
    _onEdit(e, id,elem){
        e.preventDefault();
        const formData = {};
        const form = document.forms[0];
        const userName = elem.querySelector('.username h3'),
                  title = elem.querySelector('.info .title h4'),
                  body = elem.querySelector('.info .body p');
        Array.from(form.elements)
            .filter((item) => !!item.name)
            .forEach((elem) => {
                formData[elem.name] = elem.value;
            });
        formData['id'] = id;
        if (!this._validateForm(form, formData)) {
            return;
        }
        const userid = formData['userid'];
        this.api.edit(formData, id).then((data) => {
            title.textContent = `${data.title}`;
            body.textContent = `${data.body}`;
        }).then(this.api.getName(userid).then((name) => userName.textContent = `${name}`));
        form.reset();
        this.closeEdit();
    }
    _validateForm(form, formData) {
        const errors = [];
        if (formData.userid > 10 || formData.userid < 0 || isNaN(+formData.userid)) {
            errors.push('Поле UserId не должно иметь значения больше 10 или меньше 0');
        }
        if (!formData.userid.length || !formData.title.length || !formData.body.length) {
            errors.push('Все поля должны быть заполнены!');
        }

        if (errors.length) {
            const errorEl = form.getElementsByClassName('form-errors')[0];
            errorEl.innerHTML = errors.map((er) => `<div>${er}</div>`).join('');

            return false;
        }

        return true;
    }
}

class MainService{
    constructor(postService, modalService, api){
        this.modalService = modalService;
        this.api = api;
        this.postService = postService;
        this.addBtn = document.querySelector('.add-button');
        this.addBtn.addEventListener('click', (e) => this._onOpenModal(e));
    }
    init(){
        console.log('');
    }
    _onOpenModal(){
        this.modalService.open();
    }
}

class ModalService{
    constructor(postService, api) {
        this.api = api;
        this.postService = postService;
        this.addModal = document.querySelector('#modal');
        this.editModal = document.querySelector('#editModal');
        this.editListener = this.closeEdit.bind(this);
        document.querySelector('#editModal__button-close').addEventListener('click', this.editListener);
        this.listener = this.close.bind(this);
        document.querySelector('#modal__button-close').addEventListener('click', this.listener);

        this.submitBtn = document.querySelector('#modal__button-submit');
        this.submitBtn.addEventListener('click', this._onCreate.bind(this));

    }

    open(){
        this.addModal.classList.toggle('visually-hidden');
    }
    close(){
        let myInput = document.querySelector('.form-control') 
        myInput.value = "";
        this.addModal.classList.toggle('visually-hidden');
    }
    closeEdit(){
        this.editModal.classList.toggle('visually-hidden');
    }
    _onCreate(e) {
        e.preventDefault();

        const formData = {};
        const form = document.forms[1];
        Array.from(form.elements)
            .filter((item) => !!item.name)
            .forEach((elem) => {
                formData[elem.name] = elem.value;
            });
        if (!this._validateForm(form, formData)) {
            return;
        }
        this.api.getName(formData.userid).then((res) => {
            formData['userid'] = res;
            return formData;
        }).then((formData) => this.api.create(formData).then((data) => {
            this.postService.addPost(data.userid, data.title, data.body, data.id);
        }));
        form.reset();
        this.close();
    }
   
    _validateForm(form, formData) {
        const errors = [];
        if (formData.userid > 10 || formData.userid < 0 || isNaN(+formData.userid)){
            errors.push('Поле UserId не должно иметь значения больше 10 или меньше 0');
        }
        if (!formData.userid.length || !formData.title.length || !formData.body.length) {
            errors.push('Все поля должны быть заполнены!');
        }

        if (errors.length) {
            const errorEl = form.getElementsByClassName('form-errors')[0];
            errorEl.innerHTML = errors.map((er) => `<div>${er}</div>`).join('');

            return false;
        }

        return true;
    }
}

const api = new ApiService();
const postService = new PostService(api);
const modalService = new ModalService(postService, api);
const service = new MainService(postService, modalService, api);
service.init();