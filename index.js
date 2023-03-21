//MASTODON SUBMISSIONS TRACKER USING NODE.JS THRU CLI
//CREATED BY: Ming Yuan Kow and Jeon Wonje
//NOTE: THIS FILE IS MEANT TO RUN FOR THE CLI, FOR THE JS FILE FOR THE WEBAPP REFER TO MASTO.JS

//HTTP REQUEST PATHS[ADD IT IN THE REQUEST FUNCTION AS THE PATH PARAMETER: M.get(path, [params], callback)]:
//to GET featured tags of your profile: featured_tags (NOTE: tags need to be added as featured tags by students for it to be recognised)
// to GET lookup id of account: accounts/lookup
// to GET all statuses of an account: accounts/:id/statuses
// to GET all accounts: admin/accounts
// to POST a status: statuses
// to create a new account: accounts

//CURRENT CODE PROGRESS:
//Able to post status: COMPLETED
//Able to get featured tags: COMPLETED
//Able to lookup id of account of inputted username: COMPLETED
//Able to check if tag is posted on inputted user's statuses: COMPLETED
//Able to check student submission date: COMPLETED
//Able to input tag to check: COMPLETED
//Able to check all users for the tag: COMPLETED
//Able to check user's class: COMPLETED
//Able to sort by class and check their submissions: COMPLETED
//Able to find user's class: COMPLETED
//Able to search class and see users: COMPLETED
//Able to create new user(for students and admin): COMPLETED
//Able to reply to submissions: COMPLETED
//Able to make annoucements: NO API METHOD FOR IT, USE ADMIN PANEL
//Able to pull resource uploaded to status with the tag: COMPLETED
//Able to resource drop: WILL HAVE TO DO IT THRU A HTML FORM AND COLLECT THE FORM DATA

//importing npm modules
import fs from 'fs';
import Mastodon from "mastodon-api";//import masotodn api client
import { createInterface } from "readline"; //importing CLI input
import ENV from "dotenv";//import env var
import chalk from "chalk";//import command prompt color change

ENV.config(); //config env var

console.log("\nMastodon submissions tracker loading...");

//logging in to mastodon
const M = new Mastodon({
  access_token: process.env.ACCESS_TOKEN,
  //client_key: process.env.CLIENT_KEY,
  //client_secret:process.env.CLIENT_SECRET,
  api_url: "https://tinkertofu.com/api/v1/", 
});

//creating interface for status input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
// create empty user input
let userInput = "";
//variable creation
let id = "";
let datecreated = "";
let searchtag = "";
let userclass = "";
let searchtype ="";
let statusreply = "";
const students = {};

//asks user what they want to do
rl.question(
  `\nWHAT WOULD U LIKE TO DO:\n1.POST STATUS\n2.CHECK STUDENT SUBMISSION/CLASS\n3.CHECK SUBMISSION OF ALL STUDENTS
4.LOOK AT SUBMISSIONS OF A CLASS\n5.CHECK CLASSES\n6.CREATE NEW ACCOUNT
7.MASS CREATE ACCOUNTS\n8.REPLY TO SUBMISSION\n9.EXIT\nYOUR OPTION: `,
  async function (string) {
    userInput = string; //stores input in userInput variable
    if (userInput == "exit" || userInput == "EXIT" || userInput == "9") {
      // if user says to exit
      console.log("\nEXITING..."); //close interface
      rl.close();
    } else if (userInput == "POST STATUS" || userInput == "post status" || userInput == "1") {
      // question user to enter status to post
      rl.question(
        "\nSTATUS TO POST (type 'exit' to close interface):",
        function (string) {
          userInput = string; //stores input in userInput variable
          if (userInput == "exit" || userInput == "EXIT") {
            // if user says to exit
            console.log("\nEXITING..."); //close interface
            rl.close();
          } else {
            console.log("\nTO POST: " + userInput); //prints input
            //setting params for status post
            const params = {
              status: userInput, // sets status to be posted as userInput
              visibility: "unlisted", // sets the visibility settings of the post as unlisted
            };
            //status post
            M.post("statuses", params, (error, data) => {
              if (error) {
                console.error(error);
              } else {
                console.log(data.url);
                console.log("\nStatus updated! EXITING...");
              }
            });
            rl.close();
          }
        }
      );
    } else if ( userInput == "check student submission/class" || userInput == "CHECK STUDENT SUBMISSION/CLASS" || userInput == "2") {
      rl.question("\nusername: ", function (string) {
        userInput = string;
      rl.question("\nAre you checking for student's submission or class?(class/submission):", function(string){
        searchtype = string;
        if (searchtype == 'class'|| searchtype == 'CLASS'){
            const params = {
              acct: userInput,
            };
            M.get("accounts/lookup", params, (error, data) => {
              if (error) {
                console.log("\nUSER NOT FOUND. EXITING...\n");
                console.error(error);
              } else {
                userInput = string;
                id = data.id;
                console.log("\nid of account:" + id);
                if (data.roles == ""){
                  console.log("Student not assigned class.");
                } else {
                  console.log("Student Class: " + data.roles[0].name);
                }
              }
              rl.close();
            });
        } else if (searchtype == 'submission'|| searchtype == 'SUBMISSION'){
          rl.question("\ntag to search (exlcude ' # '): ", function (string) {
            searchtag = string;
            const params = {
              acct: userInput,
            };
            M.get("accounts/lookup", params, (error, data) => {
              if (error) {
                console.log("\nUSER NOT FOUND. EXITING...\n");
                console.error(error);
              } else {
                userInput = string;
                id = data.id;
                console.log("\nid of account:" + id);
                const params = {
                  id: id,
                  tagged: searchtag,
                };
                M.get("accounts/:id/statuses", params, (error, datas) => {
                  if (error) {
                    console.error(error);
                  } else if (datas == "") {
                      console.log("SUBMISSION TAG:"+ searchtag + chalk.red(" NOT FOUND! ") + "Student did not submit work.");
                      console.log();
                      console.log("Task Completed. EXITING...");
                  } else {
                    console.log();
                    console.log('USERNAME:' + data.username + ", SUBMISSION TAG: " + searchtag + chalk.green(" FOUND! ") + "Student has submitted work. " + "Student submitted work at: " + datas[0].created_at);
                    console.log('POST URL: '+ datas[0].url);
                    console.log();
                    if (datas[0].media_attachments == ''){
                      console.log('MEDIA ATTTACHMENT: No media attached');
                    }else{
                      console.log('MEDIA ID: ' + datas[0].media_attachments[0].id);
                      console.log('MEDIA URL: ' + datas[0].media_attachments[0].url);
                      console.log();
                    }
                    console.log("data printed. EXITING...");
                  }
                });
              }
            });
            rl.close();
          });
        } else{
          console.log('INVALID INPUT. EXITING...')
          rl.close();
        }
      });
      });
    } else if ( userInput == "check submission of all students" || userInput == "CHECK SUBMISSION OF ALL STUDENTS" || userInput == "3") {
        rl.question("\ntag to search (exlcude ' # '): ", function (string) {
            searchtag = string;
            M.get('admin/accounts', (error, data) => {
                if (error){
                    console.error(error);
                } else {
                    console.log();
                    console.log("GETTING ALL ACCOUNTS...");
                    for (let i in data){
                        const params = {
                            id: data[i].id,
                            tagged: searchtag,
                          };
                          M.get("accounts/:id/statuses", params, (error, datas) => {
                            if (error) {
                              console.error(error);
                            } else if (datas == "") {
                              console.log('USERNAME:' + data[i].username + ", SUBMISSION TAG: " + searchtag + chalk.red(" NOT FOUND! ") + "Student did not submit work.");
                            } else {
                              console.log('USERNAME:' + data[i].username + ", SUBMISSION TAG: " + searchtag + chalk.green(" FOUND! ") + "Student has submitted work. " + "Student submitted work at: " + datas[0].created_at);                              
                              console.log('POST URL: '+ datas[0].url);
                              if (datas[0].media_attachments == ''){
                                console.log('MEDIA ATTTACHMENT: No media attached');
                              }else{
                                console.log('MEDIA ID: ' + datas[0].media_attachments[0].id);
                                console.log('MEDIA URL: ' + datas[0].media_attachments[0].url);
                                console.log();
                              }
                            }
                        }); 
                    } 
                }
            });
            rl.close();
        });
      } else if ( userInput == "LOOK AT SUBMISSIONS OF A CLASS" || userInput == "look at submissions of a class" || userInput == "4") {
        rl.question("\nclass(case-sensitive): ", function (string) {
          userclass = string;
          rl.question("\nsubmission tag: ", function (string) {
            searchtag = string;
            M.get('admin/accounts', (error, data) => {
              if (error){
                  console.error(error);
              } else {
                  console.log();
                  console.log("FINDING USERS IN CLASS...");
                  // console.log(data);
                  for (let i in data){
                    id = data[i].id;
                    if (data[i].role.name == userclass) {
                      const params = {
                        id: data[i].id,
                        tagged: searchtag,
                      };
                      M.get("accounts/:id/statuses", params, (error, datas) => {
                        if (error) {
                          console.error(error);
                        } else if (datas == "") {
                          console.log('USERNAME:' + data[i].username + ", SUBMISSION TAG: " + searchtag + chalk.red(" NOT FOUND! ") + "Student did not submit work.");
                        } else {
                          datecreated = datas[0].created_at;
                          console.log('USERNAME:' + data[i].username + ", SUBMISSION TAG: " + searchtag + chalk.green(" FOUND! ") + "Student has submitted work. " + "Student submitted work at: " + datecreated);
                          console.log('POST URL: '+ datas[0].url);
                          if (datas[0].media_attachments == ''){
                            console.log('MEDIA ATTTACHMENT: No media attached');
                          }else{
                            console.log('MEDIA ID: ' + datas[0].media_attachments[0].id);
                            console.log('MEDIA URL: ' + datas[0].media_attachments[0].url);
                            console.log();
                          }
                        }
                      });
                    } else if (data[i].role.name != userclass){

                  } 
                }
              }
            });
            rl.close();
          });
        });
    }else if ( userInput == "check classes" || userInput == "CHECK CLASSES" || userInput == "5") {
      rl.question("\nClass Role (case-sensitive): " , function (string) {
        userclass = string;
          M.get('admin/accounts', (error, data) => {
              if (error){
                  console.error(error);
              } else {
                  console.log();
                  console.log("GETTING ALL STUDENTS IN THE CLASS...");
                  console.log();
                  let index = 1;
                  console.log('FOR CLASS: ' + userclass);
                  const myPromise = new Promise ((resolve,reject) =>{ 
                    for (let i in data){
                      if (data[i].role.name == userclass){
                         console.log(index + '. username:' + data[i].username + chalk.green(" FOUND! "));                              
                         const user = {
                           username: data[i].username,
                           id: data[i].id,
                         }
                         students["user" + index] = user;
                         index++;
                       }  else if (data[i].role.name != userclass) {
                        
                       } 
                      } 
                      setTimeout(() => {
                        resolve(students);  // Resolve the promise after 1 second with a value
                      }, 1000);
                    }).then((value)=>{
                      console.log(value);
                      console.log('EXITING...')
                      //resolve(students);
                    });
                    /*M.get("accounts/:id/statuses", params, (error, datas) => {
                      if (error) {
                        console.error(error);
                      } else if (datas == ''){
                      } else {
                        console.log(index + '. username:' + data[i].username + chalk.green(" FOUND! "));                              
                        index++;
                      }
                    }); 
                    } 
                    setTimeout(() => {
                      resolve("EXITING...");  // Resolve the promise after 1 second with a value
                    }, 1000);
                });
                myPromise.then((value)=>{
                  console.log("\n" + value)
                });*/
              }
          });
        rl.close();
      })
    }else if ( userInput == "create new account" || userInput == "CREATE NEW ACCOUNT" || userInput == "6") {
      rl.question("\nusername: ", function (string){
        userInput = string;
        rl.question("\nemail: ", function (string){
          let email = string;
          rl.question("\npassword: ", function (string){
            let password = string;
            const params ={
              username: userInput,
              email: email,
              password: password,
              agreement:'true',
              locale: 'en',
            }
            console.log();
            console.log("CREATING ACCOUNT...");
            M.post("accounts", params, (error, data) => {
              if(error){
                console.error(error);
              } else{
                console.log("ACCOUNT CREATED!");
                console.log(data.id);
                console.log("username: " + userInput);
                console.log("email: " + email);
                console.log("password: " + password);
                console.log('\nEXITING...')
              }
            });
            rl.close();
          });
        });
      });
    } else if ( userInput == "reply to submission" || userInput == "REPLY TO SUBMISSION" || userInput == "8") {
      rl.question("\nusername to reply to: ", function (string) {
        userInput = string;
          rl.question("\nstatus tag (exlcude ' # '): ", function (string) {
            searchtag = string;
            rl.question("\nstatus to post: ", function (string){
              statusreply = string;
              const params = {
                acct: userInput,
              };
              M.get("accounts/lookup", params, (error, data) => {
                if (error) {
                  console.log("\nUSER NOT FOUND. EXITING...\n");
                  console.error(error);
                } else {
                  userInput = string;
                  id = data.id;
                  console.log("\nid of account:" + id);
                  const params = {
                    id: id,
                    tagged: searchtag,
                  };
                  M.get("accounts/:id/statuses", params, (error, datas) => {
                    if (error) {
                      console.error(error);
                    } else if (datas == "") {
                        console.log("Status:" + chalk.red(" NOT FOUND! ") + "NO STATUS TO REPLY TO. ");
                        console.log();
                        console.log("EXITING...");
                    } else {
                      console.log();
                      console.log('Status:' + chalk.green(" FOUND! ") + "POSTING STATUS... ");
                      console.log();
                      const params ={
                        status: statusreply,
                        visibility: 'public',
                        in_reply_to_id: datas[0].id,
                      };
                      M.post("statuses", params, (error,data) =>{
                        if (error){
                          console.error(error);
                        }else{
                          console.log("TO POST: "+ statusreply);
                          console.log(data.url);
                          console.log("STATUS POSTED! EXITING...");
                        }
                      });
                    }
                  });
                }
              });
              rl.close();
            });
          });
      });
    } else if ( userInput == "mass create accounts" || userInput == "MASS CREATE ACCOUNTS" || userInput == "7") {
      rl.question('\nREAD INSTRUCTIONS.txt BEFORE CONTINUING. ', function (string) {
        //READ INSTRUCTIONS.txt BEFORE CONTUINING
        userInput = string;
        if(string == 'exit') {
          console.log("EXITING...");
          rl.close();
        } else {
          // Read the contents of the JSON file
        fs.readFile('data.json', 'utf8', (err, data) => {
          if (err) throw err;
          const JSONdata = JSON.parse(data);
          //console.log(JSONdata);
          generateAccountsList(JSONdata);
        });

        // Password generator
        function generatePassword(length) {
          let chars =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+';
          let password = '';
          for (var i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return password;
        }

        async function generateAccountsList(data) {
          const email = data.email; // email is an array of emails
          const name = data.name; // name is an array of names
          for (let i = 0; i < email.length; i++) {
            const formattedName = name[i].split(' ').join('');
            console.log('\n...');
            const password = generatePassword(10); // Minimum is 8 Chars for a mastodon password. We use 10
            const details = `Account details for ${name[i]}: ${email[i]}, ${password}, ${formattedName}\n`;
            console.log(details);
            createAccount(email[i], password, formattedName);
            fs.appendFile('data.txt', details, (err) => {
              if (err) throw err;
              console.log('Data saved to file');
            });
            await delay();
          }
        }

        function delay() {
          return new Promise((resolve) => setTimeout(resolve, 5000));
        }

        async function createAccount(email, password, username) {
          const params = {
            agreement: 'true',
            email: email,
            locale: 'en',
            password: password,
            username: username,
          }
          console.log("CREATING ACCOUNT...");
          const status = await new Promise ((resolve,reject) => {
            M.post("accounts", params, (error, data) => {
              if(error){
                console.error(error);
                reject(error);
              } else{
                const params ={
                  id: data.id,
                };
                M.post("admin/accounts/:id/approve", params, (error, data) => {
                  if(error){
                    console.error(error);
                  }else{
                    resolve("ACCOUNT CREATED");
                    //when git pushing, REMOVE all data from data.json
                  }
                })
              }
            })
          }).then((value) =>{
            console.log(value);
          }).catch(error =>{
            console.error(error);
          });
        }
        rl.close();
      }
      });
    } else {
      console.log("invalid command. EXITING...");
      rl.close();
    }
  });

