import requests
B='http://localhost:5000/api'
def sess(u,p='qa_pass_123'):
    s=requests.Session(); r=s.post(B+'/auth/login',json={'username':u,'password':p}); return s,r
res=[]
def chk(label,got,exp):
    ok = got in exp if isinstance(exp,(list,tuple,set)) else got==exp
    res.append((label,got,exp,'PASS' if ok else 'FAIL')); print(('PASS' if ok else 'FAIL'),label,got,'expected',exp)

adm,r=sess('qa_admin'); chk('admin login',r.status_code,200)
tea,r=sess('qa_teacher'); chk('teacher login',r.status_code,200); print('teacher me',tea.get(B+'/auth/me').json())
sa,r=sess('qa_stud_a'); chk('student A login',r.status_code,200); print('studentA me',sa.get(B+'/auth/me').json())
sb,_=sess('qa_stud_b')
chk('bad password rejected', requests.post(B+'/auth/login',json={'username':'qa_admin','password':'wrong'}).status_code,[401,403])
chk('no password hash in login response','password' in str(r.json()),False)
chk('admin session persists',adm.get(B+'/auth/me').status_code,200)

for ep in ['/students','/subjects','/marks','/attendance','/users','/audit-logs','/departments','/classes','/teachers','/teacher-assignments','/performance','/reports/class-summary','/reports/attendance-summary','/dashboard/stats']:
    chk('admin GET '+ep,adm.get(B+ep).status_code,200)
chk('no password_hash in users list','password_hash' in adm.get(B+'/users').text,False)

chk('studentA own profile',sa.get(B+'/students/21').status_code,200)
chk('studentA OTHER profile',sa.get(B+'/students/22').status_code,[403,404])
chk('studentA own results',sa.get(B+'/results/21').status_code,200)
chk('studentA OTHER results',sa.get(B+'/results/22').status_code,[403,404])
chk('studentA own performance',sa.get(B+'/performance/21').status_code,200)
chk('studentA OTHER performance',sa.get(B+'/performance/22').status_code,[403,404])
m=sa.get(B+'/marks'); ids={x.get('student_id') for x in m.json()} if m.status_code==200 else None
chk('studentA marks list scoped',str(ids),["{21}"])
a=sa.get(B+'/attendance'); aids={x.get('student_id') for x in a.json()} if a.status_code==200 else None
chk('studentA attendance list scoped',str(aids),["{21}"])
st=sa.get(B+'/students'); sids={x.get('id') for x in st.json()} if st.status_code==200 else None
chk('studentA students list scoped',str(sids),["{21}"])
chk('student users',sa.get(B+'/users').status_code,403)
chk('student audit logs',sa.get(B+'/audit-logs').status_code,403)
chk('student reports',sa.get(B+'/reports/class-summary').status_code,403)

chk('student POST marks',sa.post(B+'/marks',json={'student_id':21,'subject_id':21,'internal_marks':10,'external_marks':10}).status_code,403)
chk('student PUT marks',sa.put(B+'/marks/37',json={'internal_marks':30,'external_marks':70}).status_code,403)
chk('student DELETE marks',sa.delete(B+'/marks/37').status_code,403)
chk('student POST attendance',sa.post(B+'/attendance',json={'student_id':21,'subject_id':21,'total_classes':10,'attended_classes':5}).status_code,403)
chk('student PUT attendance',sa.put(B+'/attendance/37',json={'total_classes':10,'attended_classes':5}).status_code,403)
chk('student DELETE attendance',sa.delete(B+'/attendance/37').status_code,403)
chk('student POST students',sa.post(B+'/students',json={'student_id':'X','name':'x','roll_number':'r','department':'d','semester':1}).status_code,403)
chk('student POST subjects',sa.post(B+'/subjects',json={'subject_code':'X1','subject_name':'x','semester':1,'credits':3}).status_code,403)
chk('student POST users',sa.post(B+'/users',json={'username':'x','password':'y','role':'Admin'}).status_code,403)
chk('student DELETE user',sa.delete(B+'/users/1').status_code,403)

chk('teacher marks unassigned POST',tea.post(B+'/marks',json={'student_id':25,'subject_id':24,'internal_marks':10,'external_marks':10}).status_code,403)
chk('teacher PUT marks unassigned',tea.put(B+'/marks/38',json={'internal_marks':11,'external_marks':11}).status_code,403)
chk('teacher DELETE marks unassigned',tea.delete(B+'/marks/38').status_code,403)
chk('teacher PUT attendance unassigned',tea.put(B+'/attendance/38',json={'total_classes':10,'attended_classes':5}).status_code,403)
chk('teacher DELETE attendance unassigned',tea.delete(B+'/attendance/38').status_code,403)
chk('teacher create user',tea.post(B+'/users',json={'username':'x','password':'y','role':'Admin'}).status_code,403)
chk('teacher audit-logs',tea.get(B+'/audit-logs').status_code,403)
chk('teacher delete student',tea.delete(B+'/students/21').status_code,403)
chk('teacher create department',tea.post(B+'/departments',json={'name':'x','code':'x'}).status_code,403)

r=adm.post(B+'/marks',json={'student_id':25,'subject_id':21,'internal_marks':28,'external_marks':62})
chk('admin create marks',r.status_code,[200,201])
if r.status_code in (200,201):
    row=[m for m in adm.get(B+'/marks').json() if m['student_id']==25 and m['subject_id']==21][0]
    nid=row['id']; chk('marks total calc',row.get('total_marks'),90.0); chk('marks grade',row.get('grade'),'A+'); chk('marks pass',row.get('pass_fail'),'Pass')
    chk('duplicate marks rejected',adm.post(B+'/marks',json={'student_id':25,'subject_id':21,'internal_marks':1,'external_marks':1}).status_code,[400,409])
    chk('internal>30 rejected',adm.put(B+f'/marks/{nid}',json={'internal_marks':35,'external_marks':10}).status_code,400)
    chk('external>70 rejected',adm.put(B+f'/marks/{nid}',json={'internal_marks':10,'external_marks':80}).status_code,400)
    chk('admin update marks',adm.put(B+f'/marks/{nid}',json={'internal_marks':10,'external_marks':25}).status_code,200)
    row=[m for m in adm.get(B+'/marks').json() if m['id']==nid][0]
    chk('updated grade F',row.get('grade'),'F'); chk('updated fail',row.get('pass_fail'),'Fail')
    chk('admin delete marks',adm.delete(B+f'/marks/{nid}').status_code,200)
chk('attended>total rejected',adm.post(B+'/attendance',json={'student_id':25,'subject_id':21,'total_classes':10,'attended_classes':12}).status_code,400)
chk('total 0 rejected',adm.post(B+'/attendance',json={'student_id':25,'subject_id':21,'total_classes':0,'attended_classes':0}).status_code,400)
r=adm.post(B+'/attendance',json={'student_id':25,'subject_id':21,'total_classes':100,'attended_classes':80})
chk('admin create attendance',r.status_code,[200,201])
if r.status_code in (200,201):
    row=[m for m in adm.get(B+'/attendance').json() if m['student_id']==25 and m['subject_id']==21][0]
    chk('attendance pct',row.get('attendance_percentage'),80.0); chk('attendance status',row.get('status'),'ELIGIBLE')
    chk('attendance PUT invalid counts',adm.put(B+f"/attendance/{row['id']}",json={'total_classes':10,'attended_classes':20}).status_code,400)
    chk('attendance PUT ok',adm.put(B+f"/attendance/{row['id']}",json={'total_classes':100,'attended_classes':50}).status_code,200)
    row=[m for m in adm.get(B+'/attendance').json() if m['id']==row['id']][0]
    chk('attendance shortage',row.get('status'),'SHORTAGE')
    chk('admin delete attendance',adm.delete(B+f"/attendance/{row['id']}").status_code,200)
chk('duplicate student_id rejected',adm.post(B+'/students',json={'student_id':'S1001','name':'dup','roll_number':'zz99','department':'CS','semester':1}).status_code,[400,409])
chk('duplicate roll rejected',adm.post(B+'/students',json={'student_id':'ZZ999','name':'dup','roll_number':'2023CS01','department':'CS','semester':1}).status_code,[400,409])
chk('duplicate subject code rejected',adm.post(B+'/subjects',json={'subject_code':'CS401','subject_name':'dup','semester':4,'credits':3}).status_code,[400,409])
chk('invalid student id marks rejected',adm.post(B+'/marks',json={'student_id':99999,'subject_id':21,'internal_marks':10,'external_marks':10}).status_code,[400,404,409])
chk('invalid subject id marks rejected',adm.post(B+'/marks',json={'student_id':25,'subject_id':99999,'internal_marks':10,'external_marks':10}).status_code,[400,404,409])

adm.put(B+'/users/7/status',json={'is_active':False})
chk('inactive login blocked',requests.post(B+'/auth/login',json={'username':'qa_stud_b','password':'qa_pass_123'}).status_code,403)
chk('existing session invalidated',sb.get(B+'/students').status_code,403)
adm.put(B+'/users/7/status',json={'is_active':True})

chk('logout',sa.post(B+'/auth/logout').status_code,200)
chk('after logout protected',sa.get(B+'/marks').status_code,401)
for ep in ['/marks','/attendance','/students/21','/results/21','/performance/21','/users','/audit-logs','/dashboard/stats','/subjects','/departments','/classes','/teachers','/teacher-assignments','/reports/class-summary']:
    chk('unauth GET '+ep,requests.get(B+ep).status_code,401)

print('\nFAILURES:',[x[:1]+x[1:3] for x in res if x[3]=='FAIL'])
print('TOTAL',len(res),'PASS',len([x for x in res if x[3]=='PASS']))
