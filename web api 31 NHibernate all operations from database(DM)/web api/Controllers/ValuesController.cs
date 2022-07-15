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
        public HttpResponseMessage Get()
        {
            var allItems = new ItemContext().GetAll();
            var json = JsonConvert.SerializeObject(allItems);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/sort/{column}/{order}")]
        public HttpResponseMessage Get3(string column, string order)
        {
            var allItems = new ItemContext();
            var items = allItems.Sort(column, order);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/addData")]
        public HttpResponseMessage Post(BookModels book)
        {
            var allItems = new ItemContext();
            var items = allItems.TempAddFunction(book.Isbn, book.Title, book.Subtitle, book.Author, book.Publisher, book.Pages, book.Description, book.Website);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/update/{id}")]
        public HttpResponseMessage Post1(BookModels book, int id)
        {
            var allItems = new ItemContext();
            var items = allItems.UpdateRow(id, book.Isbn, book.Title, book.Subtitle, book.Author, book.Publisher, book.Pages, book.Description, book.Website);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/search/{column}")]
        public HttpResponseMessage Post2(string column, SearchString searchStr)
        {
            var allItems = new ItemContext();
            var items = allItems.Search(column, searchStr.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/delete")]
        public HttpResponseMessage Post3(DeleteId searchId)
        {
            var allItems = new ItemContext();
            var items = allItems.Del(searchId.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Route("book/sortselected/{sortColumn}/{searchColumn}/{order}")]
        public HttpResponseMessage Post4(string sortColumn, string searchColumn, string order, SearchString searchStr)
        {
            var allItems = new ItemContext();
            var items = allItems.SortSelected(sortColumn,searchColumn,order,searchStr.searchString);
            var json = JsonConvert.SerializeObject(items);
            HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }
    }
}