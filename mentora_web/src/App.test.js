import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

jest.mock("./context/AppContext",()=>({useApp:()=>({isAuthenticated:false,loading:false})}));
jest.mock("./components/LandingPage",()=>()=> <div>صفحه اصلی منتورا</div>);
jest.mock("./components/AffiliatePortal",()=>()=> <div>پنل همکاری</div>);
for(const component of ["OnBoarding","Tutor","Today","SignIn","Reports","Profile","Practice","PlanningAssistant","Login","FocusTimer","Home","Navbar","SideBar","Footer","SubscriptionPlans","Subscription","NotFound","blogpost","Bloglist","StudyLoading","SubscriptionSuccessPopup","FinalExams","AboutUs","Support","AdminConsole","SupportWidget","FeatureIntroModal","RankPredictionAssistant"]) {
  jest.doMock(`./components/${component}`,()=>()=>null);
}
const {default:App,PublicHome}=require("./App");

test.each([["marketing.mentoralearn.ir","پنل همکاری"],["mentoralearn.ir","صفحه اصلی منتورا"],["www.mentoralearn.ir","صفحه اصلی منتورا"],["marketing.mentoralearn.ir.example.com","صفحه اصلی منتورا"]])("root on %s renders the correct product",(hostname,text)=>{
  render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><PublicHome hostname={hostname}/></MemoryRouter>);
  expect(screen.getByText(text)).toBeInTheDocument();
});
test("the main host has a public partners route without student onboarding",()=>{
  window.history.replaceState({},"","/partners");
  render(<App/>);
  expect(screen.getByText("پنل همکاری")).toBeInTheDocument();
});
