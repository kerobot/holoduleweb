using holoduleweb.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestSharp;
using System;

namespace holoduleweb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoloduleController : ControllerBase
    {
        private readonly IDataService _dataService;
        private readonly ILogger<HoloduleController> _logger;

        public HoloduleController(ILogger<HoloduleController> logger, IDataService dataService)
        {
            _logger = logger;
            _dataService = dataService;
        }

        [HttpGet("{date}")]
        public string Get(string date)
        {
            string authorization = Request.Headers["Authorization"];

            var client = new RestClient
            {
                BaseUrl = new Uri(_dataService.BaseUrl)
            };

            var request = new RestRequest($"holoapi/holodules/{date}", Method.GET);
            request.Parameters.Clear();
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Authorization", authorization);

            var response = client.Execute(request);
            if (response.IsSuccessful)
            {
                return response.Content;
            }
            return "error";
        }
    }
}
