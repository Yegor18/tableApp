const body = document.querySelector("body"),
butCreateTable = document.querySelector("#downDat"),
herokuUrl = "https://damp-plains-94336.herokuapp.com/",
taskUrl = 'https://jupiter.avsw.ru/testcases/data',
testUrl ="https://www.breakingbadapi.com/api/characters",
constPages=[10,20,50];
let tableData,cntElemOfPage=constPages[0],actualData;
// cntElemOfPage - количество строк в таблице; actualData - - отображаемые данные; tableData - массив данных с сервера
// herokuUrl соединяется с основным url для предотвращения ошибок. Для тестирования заданий использовался testUrl,
// т.к. в исходном было слишком мало данных.

butCreateTable.onclick = function() {
  const spinner = document.querySelector("span"),
  isInput=document.querySelector(".containersel input");
  spinner.className="loader";
  body.insertBefore(spinner,butCreateTable);

  if (isInput)
  isInput.value ="";
  
    //спиннер удаляется после окончания загрузки
    downloadTableUrl(testUrl).then(
      ()=>
      {
        spinner.className=""; 
      }
    );
  
};

//загрузка HTML страниц
function downloadPages(data=tableData) 
{ 
  const isUl= document.querySelector("ul");
  if (isUl)
  document.querySelector(".containersel").removeChild(isUl);
  else {
    const container=document.createElement("div");
  container.className = "containersel";
  body.insertAdjacentElement("afterbegin",container);
  }
  
  let Ul =document.createElement("ul");
  Ul.style="margin:0;display:inline-block";

  for (i=1;i<=Math.ceil(data.length/cntElemOfPage);i++)
   Ul.innerHTML+=`<a><li style='display:inline-block;margin-right:20px;margin-top:20px'>${i}</li></a>`;
  Ul.querySelector("li").className="activepage";
  Ul.onclick=(event) =>{
      const target=event.target,
      activePage= Ul.querySelector(".activepage");
      // если не попали в страницу или она не изменилась, ничего не происходит
      if (target.tagName != "LI" || activePage == target)
          return;
      if (activePage)
      activePage.className='';
    
    target.className="activepage";
    dataPages(data);
  };
  
  document.querySelector(".containersel").insertAdjacentElement("afterbegin",Ul);
  dataPages(data);
}

function SetListeners(data)
{
  const table = document.querySelector("table");

  table.onclick = 
    event =>
    {
      
      let target = event.target;
      console.log(target);
      if (target.tagName === 'BUTTON') {
        let arrow = target.querySelector("i");

if (arrow)
    {
      if (arrow.classList.contains("fa-angle-down"))
      arrow.className="fas fa-angle-up";
      else
      arrow.className="fas fa-angle-down";
    }
else
    {
      const isArrow=table.querySelector("tr").querySelector("i");
      if (isArrow)
      isArrow.parentElement.removeChild(isArrow);

      target.style="padding-right:20px;width:100%";
      target.insertAdjacentHTML("beforeend","<i style='position: absolute;margin-left: 5px;' class= 'fas fa-angle-up'></i>");
    }

  sortTd(target,data);
    } 
    else if (event.target.parentElement.tagName == "TD" )
    {
      
      let itemInfo;
      if (!document.querySelector(".info"))
      {
        itemInfo = document.createElement("div");
        itemInfo.className = "info";
      table.insertAdjacentElement("afterend",itemInfo);
      }
      else 
      {
        itemInfo = document.querySelector(".info");
        itemInfo.innerHTML="";
      }

      for (i=0;i<event.target.parentElement.parentElement.children.length;i++)
      {
        let elem = document.createElement("div");
        let div = document.createElement("div");
          div.innerHTML = event.target.parentElement.parentElement.children[i].innerHTML;
        let head=table.querySelector("tr").children[i].innerHTML;
        elem.style="margin-top:20px";
        if (event.target.parentElement.parentElement.children[i].textContent==="")
        { 
            event.target.parentElement.parentElement.children[i].innerHTML = "<br/><br/>";
        }
          
        elem.innerHTML = head + div.innerHTML;
        elem.className="eleminfo";
        itemInfo.insertAdjacentElement("beforeend",elem);
        
      }

    }

  };
}

function sortTd(td,data)
{
  const dataSource = new DevExpress.data.DataSource({
    store:data,
    pageSize: cntElemOfPage,
    sort:{selector:td.textContent,
    desc: td.firstElementChild.classList.contains("fa-angle-down")},
  });


dataSource.load().done(function(result) {
    downloadDataInTable(result);
});
}

function dataPages(data)
{
  let sumPages=[];
  
  //добавляем данные со страниц в массив
  for (i = 0; i<cntElemOfPage;i++)
  {
    const numtr = (document.querySelector(".activepage").innerHTML-1)*cntElemOfPage +i;
      if (typeof data[numtr] === "undefined")
        break;
      sumPages.push(data[numtr]);
  }
  cntElemOfPage= Number(cntElemOfPage);
  // если таблица не существует рисуем её
  if (document.querySelector("table"))
  {
    //если нужно подгрузить или удалить строки таблицы, рисуем таблицу. Иначе наполняем её новыми данными без перерисовки
    if (sumPages.length == cntElemOfPage && document.querySelectorAll("tr").length == cntElemOfPage+1 && document.querySelector("table").innerHTML !=="")
      downloadDataInTable(sumPages);
    else
    downloadTable(sumPages);
  }
  else 
  downloadTable(sumPages);

}

function filterData()
{
    const container= document.querySelector(".containersel");
    const dataSource = new DevExpress.data.DataSource({
      store: tableData,
      pageSize: 1000,
      filter: [container.querySelector(".filsel").value,"contains",container.querySelector("input").value]
    });
    dataSource.load().done(function(result) {
      if (result.length == 0)
      document.querySelector("table").innerHTML="";
      else
      {
        //Чтобы select знал какие данные нужно отображать
        // записываем новые данные в переменную
        actualData=result;
        downloadPages(result);
      }
      
  });
}

//грузим данные в таблицу. БЕЗ ПЕРЕРИСОВКИ
function downloadDataInTable(data)
{
  const keysOfTable = Object.keys(data[0]);
  let tr=document.querySelectorAll("tr"),td;
  // чтобы прогрузить заголовок таблицы на один цикл больше, i<=cntElemOfPage
  for (i = 0; i<=cntElemOfPage;i++)
  {
      if (!tr[i])
        break;
    td=tr[i].querySelectorAll("td");
  
    if (i==0)
      {   

        for (j=0;j<keysOfTable.length;j++)
        {
          //меняем только текст кнопки
          let textNode = document.createTextNode(keysOfTable[j]) ;
          td[j].querySelector("button").replaceChild(textNode, td[j].querySelector("button").firstChild);
        }
        continue;
      }

    if (typeof data[i-1] === "undefined")
    break;
        

    for (j=0;j<Object.keys(data[i-1]).length;j++)
      {
        
        td[j].querySelector("div").textContent=data[i-1][Object.keys(data[i-1])[j]];
      }
  }
  // устанавливаем новые слушатели(для фильтрации)
  SetListeners(data);
}

//грузим всю таблицу
function downloadTable(data)
{
  const keysOfTable = Object.keys(data[0]),
  isTable=document.querySelector("table"),
  container=document.querySelector(".containersel");

  // таблица удаляется. Если таблицы нет, то создаем selects, input/
  if (isTable)
    body.removeChild(isTable);
  else
  {
    const selectEl = document.createElement("select");
  selectEl.innerHTML=`<option>${constPages[0]}</option><option>${constPages[1]}</option><option>${constPages[2]}</option>`;
  selectEl.className="selpage";

  container.insertAdjacentElement("beforeend",selectEl);

  selectEl.onchange= (event) =>
  {
    cntElemOfPage= event.target.value;
    downloadPages(actualData);
  };

  const filterInput= document.createElement("input");
  const filterSelect= document.createElement("select");
  filterSelect.className="filsel";

  for (i=0;i<keysOfTable.length;i++)
  filterSelect.innerHTML+=`<option>${keysOfTable[i]}</option>`;
  

  container.insertAdjacentHTML("beforeend","<br>");
  container.insertAdjacentElement("beforeend",filterInput);
  container.insertAdjacentElement("beforeend",filterSelect);

  filterInput.oninput = filterData;
  filterSelect.onchange = filterData;

  }
  let table = document.createElement('table');
  let tr=[],td;
  for (i = -1; i<cntElemOfPage;i++)
  {
    
    tr[i] = document.createElement('tr');
  
    //шапка таблицы
    if (i==-1)
      {   

        for (j=0;j<keysOfTable.length;j++)
        {
          td = document.createElement('td');
          td.style="background-color: #e7e7e7;";

          td.innerHTML="<button style='width:100%;border:0'>"+keysOfTable[j]+`</button>`;
          tr[i].appendChild(td);
          table.appendChild(tr[i]);
        }
        continue;
      }

    if (typeof data[i] === "undefined")
        break;
      
    for (let prop of Object.keys(data[i]))
    {
      td = document.createElement('td');  
      td.innerHTML = `<div>${data[i][prop]}</div>` ;
      tr[i].appendChild(td);
    }
    table.appendChild(tr[i]);
  }
  
  butCreateTable.insertAdjacentElement("afterend",table);  
  SetListeners(data);
  
}

// грузим данные по url
async function downloadTableUrl(url)
{

   return await fetch(herokuUrl + url, {
  method: "get",
  headers: {
       "Content-Type": "application/json"
  }
})
    .then(respon => respon.text())
    .then(async d => {
      if (d)
      {
        d = await JSON.parse(d);
        let data=d;

        //выполняем деструктурирование данных
        while (!Array.isArray(data)){
          ({data} = d);
        }
        
            tableData=data;
            actualData=tableData;
            if (document.querySelector("table"))
            document.querySelector("table").innerHTML="";
            downloadPages();
      }
    } );
}

  



