********************
Git-Hub helper doc: 
********************
```
cd "Your Pc folder"
```
```
git clone git@github.com:Faishal-Monir/Thesis-Management-System.git
```
```
cd Thesis-Management-System
```
```
git pull
```
```
git pull origin Faishal
```
Note: Pull the branch corresponding with your name. And after work merge them with Test branch

********************
Switching to a branch: 
********************

List Branch That You are in: 

```
git branch
```
Switch to an existing branch:

```
git checkout Faishal 
```
(Basically your name above )

************************************************
--> List of branches: 

1. Main(Do nothing here)
2. Test (Merge test everything here)
3. Faishal
4. Tanni
5. Nafiz
6. Mim

Note: For individual testing and merging to the test branch only ! 
************************
Repo name: 
``` 
Thesis-Management-System 
```
************************
Merging two branches: 

``` 
git checkout Test 
```
```
git pull origin Test
```

```
git merge Faishal
```
************************
Git push from Terminal:

```
git add .
```   
```
git commit -m "Your custom Message here" 
``` 

```
git push origin Test
```

************************ How to run the servers ************************

```
cd Thesis-Management-System; cd backend; node index.js
 ```

```
cd Thesis-Management-System; cd frontend; npm start
```

****************************************************************************
#Advanced operation Do not use if you are not sure

cd frontend ; cd src ; cd pages

$name = "create_synopsis"; foreach ($ext in "js","css") { New-Item -ItemType File -Name "$name.$ext" -Force | Out-Null }


****************************************************************************
Cache data: 

{Name: 'Mahir Labib Dihan [MLD] [Faculty]', student_id: '1234', mail: 'abc@gmail.com', usr_type: 'Faculty', status: 1}