import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { TimelineService } from '../../services/timeline.service';
import { SnackbarComponent } from '../../snackbar/snackbar.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  animations: [
    trigger('moveUp', [
      state('initial', style({ transform: 'translateY(0)' })),
      state('moved', style({ transform: 'translateY(-100px)' })),
      transition('initial <=> moved', animate('500ms ease-in-out'))
    ]),
    trigger('moveLeft', [
      state('hidden', style({ left: '50%', transform: 'translateX(-50%)', opacity: 0 })),
      state('visible', style({ left: '0', transform: 'translateX(0)', opacity: 1 })),
      transition('hidden => visible', animate('500ms ease-in-out'))
    ]),
    trigger('moveRight', [
      state('hidden', style({ right: '50%', transform: 'translateX(50%)', opacity: 1 })),
      state('visible', style({ right: '0', transform: 'translateX(0)', opacity: 1 })),
      transition('hidden => visible', animate('500ms ease-in-out'))
    ]),
    trigger('containerAnimation', [
      state('initial', style({ height: '200px', top: '0' })),
      state('expanded', style({ height: '75vh', top: '-20px' })),
      transition('initial <=> expanded', animate('500ms ease-in-out'))
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        query('.news-card', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [ 
            animate('0.5s', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }) 
      ])
    ])
  ]
})
export class TimelineComponent {
  timelineClicked = false;
  timelineActivate = false;
  paperActivate = false;
  moveState = 'initial';
  leftState = 'hidden';
  rightState = 'hidden';
  containerState = 'initial';
  searchpaperText = ''
  researchPaper: any;
  timelinePapers: any;
  firstMidPoint: number;
  secondMidPoint: number;
  isLoading = false;
  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;
  errorMessage: string = 'An error occurred!';

  constructor(private timelineService: TimelineService) {
    this.firstMidPoint = 0;
    this.secondMidPoint = 0;
  }

  test = {
    "article": {
        "id": 124043,
        "title": "A certain continuity property of the residues of the poles of $\\sum_{n\n  \\geq 1} \\Lambda(n) e^{-2 \\pi i q n } n^{-s}$ with respect to $q \\in\n  \\mathbb{Q} \\cap (0, 1)$ and the Riemann hypothesis",
        "authors": "Hisanobu Shinya",
        "journal_ref": null,
        "doi": null,
        "abstract": "  The purpose of this article is to present some result which may characterize\nnontrivial zeros of the Riemann zeta-function off the critical line\n$\\text{Re}(s) = 1/2$, if any exists. In brief, it concerns the residues of the\npoles of the function $M(s, q) \\equiv \\sum_{n \\geq 1} \\Lambda(n) e^{- 2\\pi i q\nn } n^{-s}$, where $\\Lambda$ is the arithmetical Mangoldt $\\Lambda$-function.\nSuppose that $M(s, 1/2)$ has a pole for some complex number $\\rho_{*}$, with\n$\\text{Re}(\\rho_{*}) > 1/2$. Then we discuss a certain continuity property of\nthe residues of the poles of $M(\\rho_{*}, q)$ with respect to the variable $q\n\\in \\mathbb{Q} \\cap (1/2, 1)$.\n",
        "versions": "[{\"version\": \"v1\", \"created\": \"Mon, 4 Jun 2007 08:48:54 GMT\"}, {\"version\": \"v10\", \"created\": \"Mon, 12 Jul 2010 02:01:53 GMT\"}, {\"version\": \"v11\", \"created\": \"Wed, 21 Jul 2010 13:16:39 GMT\"}, {\"version\": \"v12\", \"created\": \"Thu, 22 Jul 2010 05:53:53 GMT\"}, {\"version\": \"v13\", \"created\": \"Mon, 26 Jul 2010 03:41:03 GMT\"}, {\"version\": \"v14\", \"created\": \"Wed, 28 Jul 2010 04:00:26 GMT\"}, {\"version\": \"v15\", \"created\": \"Fri, 27 Aug 2010 15:08:40 GMT\"}, {\"version\": \"v16\", \"created\": \"Mon, 30 Aug 2010 01:21:24 GMT\"}, {\"version\": \"v17\", \"created\": \"Fri, 3 Sep 2010 13:55:30 GMT\"}, {\"version\": \"v18\", \"created\": \"Mon, 13 Sep 2010 14:47:51 GMT\"}, {\"version\": \"v19\", \"created\": \"Wed, 15 Sep 2010 03:47:18 GMT\"}, {\"version\": \"v2\", \"created\": \"Sun, 1 Jul 2007 13:36:57 GMT\"}, {\"version\": \"v20\", \"created\": \"Thu, 23 Sep 2010 18:02:41 GMT\"}, {\"version\": \"v21\", \"created\": \"Wed, 29 Sep 2010 00:09:45 GMT\"}, {\"version\": \"v22\", \"created\": \"Fri, 1 Oct 2010 09:09:02 GMT\"}, {\"version\": \"v23\", \"created\": \"Mon, 25 Oct 2010 01:26:51 GMT\"}, {\"version\": \"v24\", \"created\": \"Mon, 1 Nov 2010 05:10:34 GMT\"}, {\"version\": \"v25\", \"created\": \"Mon, 8 Nov 2010 02:13:58 GMT\"}, {\"version\": \"v26\", \"created\": \"Sat, 20 Nov 2010 01:49:48 GMT\"}, {\"version\": \"v27\", \"created\": \"Wed, 22 Dec 2010 02:30:44 GMT\"}, {\"version\": \"v28\", \"created\": \"Mon, 31 Jan 2011 08:13:24 GMT\"}, {\"version\": \"v29\", \"created\": \"Fri, 4 Mar 2011 20:18:11 GMT\"}, {\"version\": \"v3\", \"created\": \"Sun, 16 Dec 2007 10:56:29 GMT\"}, {\"version\": \"v30\", \"created\": \"Fri, 1 Apr 2011 17:26:20 GMT\"}, {\"version\": \"v31\", \"created\": \"Mon, 4 Jul 2011 21:54:21 GMT\"}, {\"version\": \"v32\", \"created\": \"Thu, 21 Jul 2011 02:57:22 GMT\"}, {\"version\": \"v33\", \"created\": \"Sat, 13 Aug 2011 00:22:07 GMT\"}, {\"version\": \"v34\", \"created\": \"Sun, 11 Sep 2011 00:46:54 GMT\"}, {\"version\": \"v35\", \"created\": \"Mon, 26 Mar 2012 21:42:07 GMT\"}, {\"version\": \"v36\", \"created\": \"Sun, 27 May 2012 00:35:38 GMT\"}, {\"version\": \"v37\", \"created\": \"Thu, 31 May 2012 12:15:44 GMT\"}, {\"version\": \"v38\", \"created\": \"Wed, 20 Jun 2012 12:43:42 GMT\"}, {\"version\": \"v39\", \"created\": \"Thu, 6 Sep 2012 12:42:55 GMT\"}, {\"version\": \"v4\", \"created\": \"Wed, 26 Dec 2007 13:10:27 GMT\"}, {\"version\": \"v40\", \"created\": \"Thu, 13 Dec 2012 09:34:36 GMT\"}, {\"version\": \"v41\", \"created\": \"Tue, 18 Dec 2012 01:44:09 GMT\"}, {\"version\": \"v42\", \"created\": \"Mon, 14 Jan 2013 12:48:13 GMT\"}, {\"version\": \"v43\", \"created\": \"Sun, 17 Mar 2013 12:04:45 GMT\"}, {\"version\": \"v44\", \"created\": \"Fri, 2 Aug 2013 03:11:54 GMT\"}, {\"version\": \"v45\", \"created\": \"Fri, 29 Nov 2013 11:51:47 GMT\"}, {\"version\": \"v46\", \"created\": \"Wed, 15 Jul 2015 02:42:50 GMT\"}, {\"version\": \"v47\", \"created\": \"Fri, 17 Jul 2015 07:07:32 GMT\"}, {\"version\": \"v48\", \"created\": \"Sat, 25 Jul 2015 13:07:15 GMT\"}, {\"version\": \"v49\", \"created\": \"Wed, 19 Aug 2015 11:02:14 GMT\"}, {\"version\": \"v5\", \"created\": \"Tue, 5 Aug 2008 10:06:18 GMT\"}, {\"version\": \"v50\", \"created\": \"Sat, 29 Aug 2015 02:05:38 GMT\"}, {\"version\": \"v51\", \"created\": \"Wed, 9 Sep 2015 04:49:53 GMT\"}, {\"version\": \"v52\", \"created\": \"Thu, 17 Sep 2015 11:26:07 GMT\"}, {\"version\": \"v53\", \"created\": \"Wed, 23 Sep 2015 03:26:46 GMT\"}, {\"version\": \"v54\", \"created\": \"Tue, 29 Sep 2015 07:32:07 GMT\"}, {\"version\": \"v55\", \"created\": \"Thu, 15 Oct 2015 07:17:10 GMT\"}, {\"version\": \"v56\", \"created\": \"Mon, 16 Nov 2015 08:41:44 GMT\"}, {\"version\": \"v57\", \"created\": \"Mon, 7 Dec 2015 07:50:52 GMT\"}, {\"version\": \"v58\", \"created\": \"Mon, 14 Dec 2015 06:38:54 GMT\"}, {\"version\": \"v59\", \"created\": \"Sun, 10 Jan 2016 10:37:35 GMT\"}, {\"version\": \"v6\", \"created\": \"Fri, 8 Aug 2008 00:00:23 GMT\"}, {\"version\": \"v60\", \"created\": \"Fri, 29 Dec 2017 04:03:57 GMT\"}, {\"version\": \"v61\", \"created\": \"Sun, 28 Jan 2018 00:48:18 GMT\"}, {\"version\": \"v62\", \"created\": \"Fri, 23 Mar 2018 08:09:36 GMT\"}, {\"version\": \"v63\", \"created\": \"Tue, 27 Nov 2018 16:55:29 GMT\"}, {\"version\": \"v64\", \"created\": \"Mon, 11 Feb 2019 04:07:40 GMT\"}, {\"version\": \"v65\", \"created\": \"Sun, 14 May 2023 15:15:00 GMT\"}, {\"version\": \"v66\", \"created\": \"Mon, 29 May 2023 08:42:46 GMT\"}, {\"version\": \"v7\", \"created\": \"Tue, 15 Jun 2010 01:47:15 GMT\"}, {\"version\": \"v8\", \"created\": \"Wed, 16 Jun 2010 06:34:44 GMT\"}, {\"version\": \"v9\", \"created\": \"Fri, 18 Jun 2010 12:20:45 GMT\"}]",
        "update_date": "2023-05-31T04:00:00.000Z",
        "content_vec": "[-0.8421106,-0.50026226,0.70197743,-0.05326406,-0.34655842,-0.1032328,0.04237775,-0.040624306,1.0005069,0.5378158,-0.22008249,-0.39974657,-0.2276449,0.29801357,-0.24465506,1.0491666,0.11783731,-0.15629387,0.27999166,-0.5458495,-0.15622683,-0.23924787,-0.17627962,0.16651084,0.93733054,1.0222154,0.43265593,0.30667874,0.2247389,0.18366651,0.302924,-0.11568113,-0.5156985,0.80799985,0.057349093,-0.66405433,-0.6759279,0.1116232,0.9584195,0.59946954,0.24652141,0.12107968,0.15654399,0.86838907,-0.38420618,-0.039916694,-0.24138872,-0.264242,-0.37727737,-0.79485524,-0.5774858,-0.5173025,-0.110650666,-0.7533482,0.519412,0.4127229,1.0147125,0.014354687,-0.14304307,-0.031878628,-0.647729,0.8549311,-0.9289929,-0.036115374,0.87211293,0.5347993,-0.21555759,-0.21928772,-0.60177904,-0.4841385,0.0003205027,0.10923061,0.25447524,-0.17299071,0.47069407,0.8047295,-0.2131574,-0.28264174,-0.69198817,0.23319718,0.6928953,0.16123809,0.4709864,-0.050072435,-0.3839665,0.17437822,-1.3175738,0.32064062,0.4522732,0.24223088,-0.26032564,0.80761635,-0.20587741,0.43353885,0.17669229,-0.21483755,-0.030670965,-0.26146972,0.03581412,-0.10803998,0.08656451,0.6664642,0.53925174,-0.09747153,0.037922427,-0.48356,-0.20816381,-0.7012058,-0.43385038,0.1180551,-0.0028864255,0.14481637,0.7802877,-0.028660752,-0.34212297,-0.05596063,0.021560686,-0.34650612,-0.3345071,0.11456284,-0.3873812,0.5060161,0.29956496,-0.78540456,0.6980489,0.7964156,0.73269546,0.32510823,-0.4215342,-0.6858064,-0.32795173,-0.44758308,1.0288308,-0.06247052,0.20304573,-0.2946541,0.54138637,-0.19198881,-0.3431383,0.49925882,-0.5241834,-0.23063618,-0.3908523,-0.52602094,-0.871797,0.41395038,-0.67560714,0.38731092,0.50721437,-0.6695563,0.327667,0.14991707,-0.28476694,0.22876501,-0.21223271,-0.54017544,0.22517657,-0.7494658,0.0003440535,-0.5574451,-0.20576026,-1.0963061,-0.67947155,0.57114834,0.04310066,0.9835855,0.0071989973,-0.5527184,-0.082642205,-0.35097817,0.21428621,-0.37258485,0.21708357,-0.20953114,-0.082978,-0.4327047,-0.011506796,-0.050273612,-0.8248045,0.18581033,0.14309755,0.34110785,0.745404,0.59003973,0.121497996,-0.9342008,0.7609504,-0.064423315,-0.02751133,-0.4755916,-0.8991953,-1.2578057,-0.68724924,0.36512107,0.5185357,-0.26670974,0.7175616,0.1172333,-0.6269389,0.11804956,-0.11626183,-0.026708324,0.50343174,0.011524082,-0.08940662,-0.2673435,-0.9151425,0.0009114417,0.126293,-0.2988513,0.45716313,0.2966428,0.5455699,1.1607163,-0.55708253,-0.01970907,-0.053647637,-0.20852983,0.9338795,0.47997075,0.4326199,-0.5327358,-1.3825428,0.11409898,-0.8388217,0.0062891394,-0.09908057,0.30105913,0.13903311,0.05710241,-0.43274212,0.5691964,-0.083716966,-1.048317,0.6353517,-0.4831588,0.4466635,-0.32508585,0.35640585,-0.21419062,-0.65672696,-0.9700636,-0.21637471,0.07450492,0.26193237,-0.3936629,0.33285794,-0.4239695,-0.3172291,0.047492094,0.16863629,0.008806511,0.5471577,-0.23233017,0.4374358,0.9731919,-0.7599902,0.14525764,0.15670027,0.09651582,0.61200005,-0.7755507,-0.2907751,-0.1422433,0.15978655,-0.9292269,0.3588536,0.52025574,-0.36649087,-0.33760282,-0.30953994,-0.41751692,0.2760202,-0.969192,0.66307694,0.4250398,0.3827513,-0.21595745,0.32182834,-0.53296894,-0.22488745,-0.17473483,-0.17733912,-0.6436879,-0.72461504,-0.20346384,0.20573597,-0.4370084,-0.0038055382,-0.020226246,-0.0757952,0.10808808,0.34988424,0.5749251,-0.23743537,-0.1666693,0.29900318,-0.69915384,-0.29962987,-0.22382343,0.50285685,-0.4058658,-0.21581429,-0.013477127,0.24723648,1.2461575,0.09189205,0.12078555,0.120464854,-0.41464925,0.2571252,-0.3320994,-0.56346285,-0.36981422,-0.28907028,-0.39813688,-0.837051,1.1598588,0.4958846,0.002804496,1.0414379,-0.048024185,-0.28122458,0.05400381,0.46612012,0.66007525,0.18606299,-0.53255343,0.628971,-1.4791192,0.054953218,-0.18700641,-0.32817432,-0.8691099,-0.21166761,0.60661227,0.9985175,-0.93911546,0.4636645,0.20787688,0.5844106,0.3910139,-0.08323219,0.098573215,-0.25519398,0.3232597,-0.32104427,-0.76591676,-0.3176069,1.1204053,0.31914786,0.69880944,0.2289012,0.5333759,0.71966475,0.6123224,-0.55621994,0.19549881,0.02559111,-0.6541135,-0.7739979,-0.0011620258,-0.56734914,0.35948524,0.030958956,-0.77399224,0.83445454,-0.033294447,-0.75586444,0.25436974,0.08928105,0.529755,0.18666132,-0.3451734,-0.13359883,-0.5241334,0.48811212,0.1449553,-0.20375058,-0.7367801,-0.018719884,0.6756279,-0.73804885,0.7483866,-0.36324707,0.23523188,0.96963996,0.4867271,0.5669104,0.45298797,-0.05089807,0.048605464,0.061054144,-0.8061895,-0.45220354,0.4568115,-0.07768685,-0.287739,-0.6457779,-0.040029056,0.5160354,0.44143587,0.45313758,0.72353584,0.3792664,0.39935943,0.633439,-0.015618191,0.4104819,0.55036885,-0.2500057,-0.6577979,0.81645304,0.4762379,0.39465907,-0.43189308,0.3280654,-0.16244188,0.2907917,-0.728987,0.4263168,-0.43994468,-0.33352068,0.05363644,-0.18982738,0.23953292,-0.44169146,-0.4463925,-1.2014158,0.34237283,0.15352789,0.4456917,0.50495523,-0.21705309,-0.13228126,-0.68624777,0.09117156,0.07325503,0.32167786,0.1934944,-0.7124395,-0.37875256,-0.3331138,-0.1224434,-0.8142264,0.17072317,0.4028517,0.331563,0.8975308,0.59699583,-0.036219448,-0.23466012,0.4005583,0.35155344,-0.8597397,-0.21272686,-0.7490581,-0.20397292,0.7932005,0.2222768,-0.8009252,-0.8585504,-0.96403724,-0.609756,0.0821919,0.36750114,-0.35237783,-0.105857305,0.44148353,0.4612192,0.37435526,-0.45514432,-0.93408215,-0.25230825,0.69729257,0.124414645,-0.5157384,-0.1568896,-0.0875622,0.25913388,0.063419566,0.32664147,0.41263017,0.11878167,-0.12199578,0.21190153,1.4913669,1.4048725,-0.6895616,0.51828605,-0.019160846,-0.27671352,0.39544985,-0.36065668,-0.5041699,-0.07053023,0.45446312,0.18002065,0.36762875,-0.25579387,0.13707358,0.17759612,0.14764775,-0.7568172,0.075971544,-0.16943558,0.18720417,0.67550635,-0.004335137,0.14656442,-0.4073307,0.70332533,0.17118151,-0.5047642,-0.6164453,0.103218526,-0.321372,-0.33413655,0.5312026,-0.91503155,-0.83905685,0.6534487,0.59506327,0.99915534,-0.19800587,0.36154374,0.6724698,0.21364325,0.41270307,0.23750149,-0.3773742,-0.3759762,-0.17238209,0.010270878,-0.3725231,-0.55706024,-0.85386235,0.21065283,-0.77679867,-0.06056383,-0.20348786,-0.22651818,0.299141,-0.3083135,-0.26920372,0.57315063,-1.0603713,0.6292606,-0.13686277,-0.3026649,-0.12368565,-0.30345798,-0.43948603,-0.48832533,0.68517023,0.030775646,-0.25565207,-0.39344886,-0.18248612,-0.8205906,0.9246297,0.38402098,-0.23389558,0.57580465,0.21878321,0.4028763,-0.5118888,0.119401686,-0.0021547033,0.6526485,-0.072995074,-0.7058955,0.31884703,-0.17856893,-0.58245295,0.50605756,-0.8117942,1.5084199,-0.48789707,-0.2594126,0.121527806,0.19657274,0.70430225,0.24400917,0.43255785,0.63637656,0.51605946,-0.12844187,0.70072895,-0.99701405,1.244606,0.6851437,0.09613781,0.6804999,0.3067701,-0.334505,0.50073373,0.581169,-0.13790184,0.3529168,0.5860961,-0.4420157,-0.30893028,0.28171962,-0.5715465,-0.016668184,0.16858552,0.07289744,-0.6159364,-0.4600798,0.51123893,-0.44831863,-0.025879122,0.028361078,0.64399236,-0.5425333,1.0867047,-0.16960242,-0.012487653,-0.3960064,-0.29407507,-0.4835728,0.13301642,-0.50621444,-0.86120296,0.42565513,-0.3981829,-0.3451225,0.29949754,0.46721604,-0.41952628,-0.42071673,-0.20063287,-0.20405544,0.4868968,-0.045091674,0.11908391,-0.2925189,-0.16820028,-0.16429508,-0.13282457,0.13972342,0.2089552,0.55545986,0.37069917,0.10745864,0.43116665,-0.93272835,0.42127347,-0.896807,-0.7412536,-0.8070323,0.61271024,-0.008855829,-0.6445344,0.9420245,0.8269284,0.10420518,-0.18556838,0.51977485,-0.32980523,0.54790586,-0.049591918,0.7402864,0.14289157,-0.018463966,0.051617652,-1.304414,-0.33502653,0.7237957,-0.21495874,-0.4364494,1.1440085,0.09800195,0.10280368,-0.121443726,0.48785836,-0.113353714,0.46686414,0.20003557,0.40488365,-0.5302999,-0.6667001,-0.14046715,-0.6089862,-0.3178735,-0.6716803,-0.43668404,-0.6413485,-0.07784391,-0.83094263,-0.24868125,0.20226982,0.640207,-0.8677029,-0.42414692,-0.39427385,0.4986127,-0.19309375,-0.1898779,0.74637246,-0.12598759,-0.17632338,0.044430107,0.7369692,0.16111833,-0.46581098,-0.43438363,0.092890754,0.04167161,0.1820577,1.2161704,-0.54265785,-0.25866434,0.10500186,0.07374145,0.24328816,0.93646777,-0.31908762,-0.057167154,0.7370464,0.019015765,0.6210578,0.28184992,0.37980962,0.27195755,0.34592047,0.3009185,0.35350543,-0.13946097,-0.19936544,0.29077432,0.36092207,-0.54970473,-0.861465,0.5071216,-1.1962934,0.5861425,0.74431205,-0.61320376,0.004734869,-0.44272503,0.09704364,-0.29917973,-0.33866838,0.6733634,0.48945567,-0.6701624,-0.2764021,-0.50328887,0.17794943,0.6387445,-0.45720404,0.1963205,-0.2397235,0.52709484,0.5842376,0.7421075,-0.139255,0.6051915,0.28481278,-0.23666789,-0.19508728,-0.6506494,-0.06257294,-0.022077842,0.41725725,-0.42457235]",
        "distance": 0,
        "similarity": 0.6680869864011088
    }
}

  searchPaper() {
    this.moveState = 'moved';
    this.containerState = 'expanded';
    
    // this.newsActivate = true
    // this.researchPaper = (this.test as any)['article']
    this.isLoading = true;
    this.timelineService.searchNews(this.searchpaperText).subscribe({
      next: (res: any) => {
        if(res == null) {
          this.handleError('No Research paper found on the topic')
          this.isLoading = false
        }
        this.paperActivate = true
        this.researchPaper = res['article']
        const object = JSON.parse(this.researchPaper.versions);
        this.researchPaper.versions = object
        this.isLoading = false
        
        // this.simulateError()
      },
      error: (err) => {
        this.handleError(err.error)
        this.isLoading = false
      }
    })

    if(this.timelineActivate === true) {
      this.getTimelineData()
    }
  }

  displayTimeline() {
    this.timelineClicked = true;
    this.timelineActivate = true;
    this.leftState = 'visible';
    this.rightState = 'visible';
    this.getTimelineData()
  }

  getTimelineData() {
    this.isLoading = true;
    this.timelineService.getTimelineNews(this.searchpaperText).subscribe({
      next: (res) => {
        let response = (res as any)
        this.timelinePapers = response['topPapers']
        this.timelinePapers.sort((a: any, b: any) => {
          const dateA = new Date(a.update_date).getTime(); 
          const dateB = new Date(b.update_date).getTime(); 
          return dateB - dateA; 
        });     
        this.firstMidPoint = this.average(response['maxSimilarity'], response['medianSimilarity']);
        this.secondMidPoint = this.average(response['minSimilarity'], response['medianSimilarity']);
        this.isLoading = false;
      },
      error: (err) => { 
        this.handleError(err.error)
        this.isLoading = false
      }
    })
  }

  changePaperFromTimeline(index: number) {
    this.researchPaper = this.timelinePapers[index]
    const object = JSON.parse(this.researchPaper.versions);
    this.researchPaper.versions = object
  }

  average(one: number, two: number) {
    return (one + two) / 2;
  }
  
  animateMove() {
    this.moveState = this.moveState === 'initial' ? 'moved' : 'initial';
    this.containerState = this.containerState === 'initial' ? 'expanded' : 'initial';
  }

  animateLeftRight() {
    this.leftState = 'visible';
    this.rightState = 'visible';
  }

  delay(index: number): string {
    return `${index * 500}ms`; 
  }

  search(keyword: string): void {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
    window.open(searchUrl, '_blank');
  }

  handleError(error: string): void {
    this.errorMessage = error; 
    this.snackbar.showSnackbar(); 
  }

  simulateError(): void {
    const error = 'An unexpected error occurred!';
    this.handleError(error);
  }

  // @Output() animate = new EventEmitter<void>();

  // triggerAnimation() {
  //   this.animate.emit();
  // }
}
