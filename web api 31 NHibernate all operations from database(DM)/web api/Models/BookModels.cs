using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace book_hibernate_web_api_2.Models
{
    public class BookModels
    {
        public virtual int Id { get; set; }
        public virtual string Isbn { get; set; }
        public virtual string Title { get; set; }
        public virtual string Subtitle { get; set; }
        public virtual string Author { get; set; }
        public virtual string Publisher { get; set; }
        public virtual int Pages { get; set; }
        public virtual string Description { get; set; }
        public virtual string Website { get; set; }
    }
}