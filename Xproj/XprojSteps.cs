using System;
using TechTalk.SpecFlow;
using Xunit;

namespace Xproj
{
	/*
		TODO: use Gulp to:

		0. Update fake csproj with feature files.

		1. Generate glue files on post-build.

			D:\Temp\Projects\DnxFlow\packages\SpecFlow.1.9.0\tools>specflow generateall D:\Temp\Projects\DnxFlow\Xproj\Xproj.csproj.fake /force /verbose
			Processing project: Xproj.csproj
			xproj.feature -> test updated

		2. Update IUseFixture -> IClassFixture.
		
		3. Resharper xUnit extension for added goodness.
	*/

	[Binding]
	public class XprojSteps
	{
		[Given(@"I have entered (.*) into the calculator")]
		public void GivenIHaveEnteredIntoTheCalculator(int p0)
		{
			//ScenarioContext.Current.Pending();
			ScenarioContext.Current["this"] = "that";
		}

		[When(@"I press add")]
		public void WhenIPressAdd()
		{
			//ScenarioContext.Current.Pending();
		}

		[Then(@"the result should be (.*) on the screen")]
		public void ThenTheResultShouldBeOnTheScreen(int p0)
		{
			//ScenarioContext.Current.Pending();
			Assert.Equal(ScenarioContext.Current["this"], "that");
		}
	}
}
