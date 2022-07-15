using book_hibernate_web_api_2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FluentNHibernate.Mapping;
using FluentNHibernate;

namespace book_hibernate_web_api_2
{
    public class BookMap: ClassMap<BookModels>
    {
        public BookMap()
        {
            Map(item => item.Isbn, "isbn");
            Map(item => item.Title,"title");
            Map(item => item.Subtitle,"subtitle");
            Map(item => item.Author,"author");
            Map(item => item.Publisher,"publisher");
            Map(item => item.Pages,"pages");
            Map(item => item.Description,"description");
            Map(item => item.Website,"website");
            Id(item => item.Id,"id").GeneratedBy.Increment();
            Table("bookdetails");
        }
    }
}