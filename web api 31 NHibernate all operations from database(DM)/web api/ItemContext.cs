using book_hibernate_web_api_2.Models;
using FluentNHibernate.Cfg;
using FluentNHibernate.Cfg.Db;
using Newtonsoft.Json;
using NHibernate;
using NHibernate.Cfg;
using NHibernate.Criterion;
using NHibernate.Tool.hbm2ddl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

namespace book_hibernate_web_api_2
{
    public class ItemContext
    {
        public IList<BookModels> GetAll()
        {
            var sessionFactory = CreateSessionFactory();

            using (var session = sessionFactory.OpenSession())
            {
                using (session.BeginTransaction())
                {
                    var items = session.CreateCriteria(typeof(BookModels)).List<BookModels>();
                    return items;
                }
            }
        }

        public IList<BookModels> TempAddFunction(string isbn, string title, string subtitle, string author, string publisher, int pages, string description, string website)
        {
            var sessionFactory = CreateSessionFactory();
            using (var session = sessionFactory.OpenSession())
            {
                using (var transaction = session.BeginTransaction())
                {
                    var book1 = new BookModels();
                    book1.Isbn = isbn;
                    book1.Title = title;
                    book1.Subtitle = subtitle;
                    book1.Author = author;
                    book1.Publisher = publisher;
                    book1.Pages = pages;
                    book1.Description = description;
                    book1.Website = website;

                    session.SaveOrUpdate(book1);
                    transaction.Commit();

                    var items = session.CreateCriteria(typeof(BookModels)).List<BookModels>();
                    return items;
                }
            }
        }

        public IList<BookModels> UpdateRow(int id, string isbn, string title, string subtitle, string author, string publisher, int pages, string description, string website)
        {
            var sessionFactory = CreateSessionFactory();
            using (var session = sessionFactory.OpenSession())
            {
                using (var transaction = session.BeginTransaction())
                {
                    var tempRow = session.Get<BookModels>(id);
                    tempRow.Isbn = isbn;
                    tempRow.Title = title;
                    tempRow.Subtitle = subtitle;
                    tempRow.Author = author;
                    tempRow.Publisher = publisher;
                    tempRow.Pages = pages;
                    tempRow.Description = description;
                    tempRow.Website = website;

                    session.SaveOrUpdate(tempRow);
                    transaction.Commit();

                    var items = session.CreateCriteria(typeof(BookModels)).List<BookModels>();
                    return items;
                }
            }
        }

        public IList<BookModels> Sort(string column, string order)
        {
            var sessionFactory = CreateSessionFactory();
            using(var session = sessionFactory.OpenSession())
            {
                using(var transaction = session.BeginTransaction())
                {
                    ICriteria book;
                    if (order == "desc")
                    {
                        book = session.CreateCriteria(typeof(BookModels)).AddOrder(Order.Desc(column));
                    }
                    else
                    {
                        book = session.CreateCriteria(typeof(BookModels)).AddOrder(Order.Asc(column));
                    }
                    return book.List<BookModels>();
                }
            }
        }

        public IList<BookModels> Search(string column, string key)
        {
            var sessionFactory=CreateSessionFactory();
            using(var session = sessionFactory.OpenSession())
            {
                using(var transaction1 = session.BeginTransaction())
                {
                    var book = session.CreateCriteria(typeof(BookModels))
                               .Add(Restrictions.Disjunction().Add(Restrictions.Like(column,key,MatchMode.Anywhere)));
                    return book.List<BookModels>();
                }
            }
        }

        public IList<BookModels> Del(int id)
        {
            var sessionFactory = CreateSessionFactory();
            using(var session = sessionFactory.OpenSession())
            {
                using(var transaction = session.BeginTransaction())
                {
                    var book = session.Get<BookModels>(id);
                    session.Delete(book);
                    var items = session.CreateCriteria(typeof(BookModels)).List<BookModels>();
                    transaction.Commit();
                    return items;
                }
            }
        }

        public IList<BookModels> SortSelected(string sortColumn, string searchColumn, string order, string key)
        {
            var sessionFactory = CreateSessionFactory();
            using (var session = sessionFactory.OpenSession())
            {
                using(var transaction = session.BeginTransaction())
                {
                    ICriteria book;
                    if (order == "asc")
                    {
                        book=session.CreateCriteria(typeof(BookModels)).Add(Restrictions.Like(searchColumn,key,MatchMode.Anywhere))
                            .AddOrder(Order.Asc(sortColumn));
                    }
                    else
                    {
                        book = session.CreateCriteria(typeof(BookModels)).Add(Restrictions.Like(searchColumn, key, MatchMode.Anywhere))
                            .AddOrder(Order.Desc(sortColumn));
                    }
                    return book.List<BookModels>();
                }
            }
        }

        private ISessionFactory CreateSessionFactory()
        {
            return Fluently
                .Configure()
                    .Database(
                        PostgreSQLConfiguration.Standard
                        .ConnectionString(c =>
                            c.Host("localhost")
                            .Port(5432)
                            .Database("books")
                            .Username("postgres")
                            .Password("Postgre1879@.")))
                    .Mappings(m => m.FluentMappings.AddFromAssemblyOf<ItemMap>())
                    .ExposeConfiguration(TreatConfiguration)
                .BuildSessionFactory();
        }
        private static void TreatConfiguration(Configuration configuration)
        {
            new SchemaExport(configuration).Create(false, false);  //false,true
        }
    }
}