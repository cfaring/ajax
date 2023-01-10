
async function create(data){
    const res = await fetch('https://jsonplaceholder.typicode.com/posts',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(data)
    });
    return await res.json();
}
function edit(data, updId){
        const id = updId;
        return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,{
            method: 'PATCH',
            body: JSON.stringify(data),
            headers:{
                'Content-type': 'application/json; charset=UTF-8',
              },
        }).then((res) => res.json()).catch((e) => alert(`error message: ${e}`));
    }
function getName(id){
        return fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((res) => res.json()).then((json) => json.username).catch((e) => alert(`error message: ${e}`));
    }
function remove(id){
        return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,{
            method:'DELETE',
        }).catch((e) => alert(`error message: ${e}`));
    }

export{create,edit, getName, remove}