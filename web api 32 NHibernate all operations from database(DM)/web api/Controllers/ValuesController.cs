using book_hibernate_web_api_2.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace book_hibernate_web_api_2.Controllers
{
    public class ValuesController : ApiController
    {
        [Route("book/details")]
        [HttpGet]
        public HttpResponseMessage Get()
        {
            var allItems = new BookContext().GetAll();
            var json = JsonConvert.SerializeObject(allItems);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/sort/{column}/{order}")]
        [HttpGet]
        public HttpResponseMessage SortAll(string column, string order)
        {
            var allItems = new BookContext();
            var items = allItems.Sort(column, order);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/addData")]
        [HttpPost]
        public HttpResponseMessage AddData(BookModels book)
        {
            var allItems = new BookContext();
            var items = allItems.TempAddFunction(book.Isbn, book.Title, book.Subtitle, book.Author, book.Publisher, book.Pages, book.Description, book.Website);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/update/{id}")]
        [HttpPost]
        public HttpResponseMessage UpdateDetails(BookModels book, int id)
        {
            var allItems = new BookContext();
            var items = allItems.UpdateRow(id, book.Isbn, book.Title, book.Subtitle, book.Author, book.Publisher, book.Pages, book.Description, book.Website);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/search/{column}")]
        [HttpPost]
        public HttpResponseMessage SearchBook(string column, SearchString searchStr)
        {
            var allItems = new BookContext();
            var items = allItems.Search(column, searchStr.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/delete")]
        [HttpPost]
        public HttpResponseMessage DeleteBook(DeleteId searchId)
        {
            var allItems = new BookContext();
            var items = allItems.Del(searchId.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/sortselected/{sortColumn}/{searchColumn}/{order}")]
        [HttpPost]
        public HttpResponseMessage SortSelected(string sortColumn, string searchColumn, string order, SearchString searchStr)
        {
            var allItems = new BookContext();
            var items = allItems.SortSelected(sortColumn,searchColumn,order,searchStr.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }
    }
}