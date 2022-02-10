import React, { Component } from 'react';
import { Button, Spinner, Container, Row, Col, Table, InputGroup, InputGroupText  } from 'reactstrap';

class HoloduleRow extends Component {
    render() {
        const holodule = this.props.holodule;
        const today = new Date();
        const holoduleDate = Common.textToDateTime(holodule.datetime);
        const timeStyle = holoduleDate.getTime() < today.getTime() ? { color: '#c0c0c0' } : { color: '#87ceeb' };
        const time = `${holoduleDate.getHours()}:${('0' + holoduleDate.getMinutes()).slice(-2)}～`;
        const imgurl = `${process.env.PUBLIC_URL}/${Common.members[holodule.name].img}`;
        const churl = `https://www.youtube.com/channel/${Common.members[holodule.name].ch}`;
        const tmburl = `http://img.youtube.com/vi/${holodule.video_id}/default.jpg`;
        return (
            <tr>
                <td>
                    <div className="card-container">
                        <div className="card-img">
                            <a href={churl}><img src={imgurl} alt="" /><p>{holodule.name}</p></a>
                        </div>
                        <div className="card-img">
                            <a href={holodule.url}><img src={tmburl} alt="" /></a>
                        </div>
                        <div className="card-text">
                            <h2 style={timeStyle}>{time}</h2>
                            <p>{holodule.title}</p>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}

class HoloduleTable extends Component {
    render() {
        const rows = [];
        this.props.holodules.forEach((holodule) => {
            rows.push( <HoloduleRow holodule={holodule} key={holodule.key} /> );
        });
        return (
            <Table hover>
                <tbody>{rows}</tbody>
            </Table>
        );
    }
}

class HoloduleNavigator extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(mode) {
        if (mode === 'prev') {
            const prevDate = Common.getPrevTextDate(this.props.textDate);
            this.props.onDateChange(prevDate);
        } else if (mode === 'next') {
            const nextDate = Common.getNextTextDate(this.props.textDate);
            this.props.onDateChange(nextDate);
        }
    }

    render() {
        return (
            <InputGroup size="lg">
                <Button color="primary" onClick={() => this.handleClick('prev')}>昨日</Button>
                <InputGroupText>{this.props.textDate}</InputGroupText>
                <Button color="primary" onClick={() => this.handleClick('next')}>明日</Button>
            </InputGroup>
        );
    }
}

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            initializing: true,
            loading: true,
            textDate: Common.dateToText(new Date()),
            holodules: []
        };
        this.handleDateChange = this.handleDateChange.bind(this);
    }

    handleDateChange(textDate) {
        this.setState({
            loading: true,
            textDate: textDate
        });
    }

    getAccessToken() {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(`api/accesstoken`, requestOptions).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(json => {
            document.cookie = `holodule_token=${json.access_token}`;
            this.setState({ initializing: false });
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    }

    getHolodules(textDate) {
        const access_token = Common.getValueFromCookie("holodule_token");
        if (!access_token) {
            this.setState({ initializing: true });
            return;
        }
        const date = Common.removeSeparatorTextDate(textDate);
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${access_token}` },
        };
        fetch(`api/holodule/${date}`, requestOptions).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(json => {
            this.setState({ loading: false, holodules: json.holodules });
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            this.setState({ loading: false, holodules: [] });
        });
    }

    render() {
        const initializing = this.state.initializing;
        const loading = this.state.loading;
        let contents;
        if (initializing) {
            this.getAccessToken();
            contents = <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Spinner color="primary">Initializing...</Spinner>
                    </Col>
                </Row>
            </Container>;
        } else if (loading) {
            this.getHolodules(this.state.textDate);
            contents = <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Spinner color="success">Loading...</Spinner>
                    </Col>
                </Row>
            </Container>;
        } else {
            contents = <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <HoloduleNavigator textDate={this.state.textDate} onDateChange={this.handleDateChange} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <HoloduleTable holodules={this.state.holodules} />
                    </Col>
                </Row>
            </Container>;
        }
        return (<div>{contents}</div>);
    }
}

export class Common {
    static dateToText(date) {
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (1 + date.getMonth()).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        let format = 'YYYY/MM/DD';
        format = format.replace(/YYYY/g, year);
        format = format.replace(/MM/g, month);
        format = format.replace(/DD/g, day);
        return format;
    }

    static textToDate(textDate) {
        const year = textDate.substr(0, 4);
        const month = Number(textDate.substr(5, 2)) - 1;
        const day = textDate.substr(8, 2);
        return new Date(year, month, day);
    }

    static getNextTextDate(textDate) {
        const date = Common.textToDate(textDate);
        return Common.dateToText(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
    }

    static getPrevTextDate(textDate) {
        const date = Common.textToDate(textDate);
        return Common.dateToText(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
    }

    static removeSeparatorTextDate(textDate) {
        return textDate.replace(/\//g, '');
    }

    static textToDateTime(textDateTime) {
        const year = textDateTime.substr(0, 4);
        const month = Number(textDateTime.substr(4, 2)) - 1;
        const day = textDateTime.substr(6, 2);
        const hour = textDateTime.substr(9, 2);
        const minute = textDateTime.substr(11, 2);
        const second = textDateTime.substr(13, 2);
        return new Date(year, month, day, hour, minute, second);
    }

    static getValueFromCookie(cookieName) {
        const cookies = document.cookie;
        const cookiesArray = cookies.split(';');
        for (var c of cookiesArray) {
            var cArray = c.split('=');
            if (cArray[0].trim() === cookieName) {
                return cArray[1];
            }
        }
        return undefined;
    }

    static members = {
        "ときのそら": { img: "tokino_sora.jpg", ch: "UCp6993wxpyDPHUpavwDFqgg" },
        "ロボ子さん": { img: "robokosan.jpg", ch: "UCDqI2jOz0weumE8s7paEk6g" },
        "さくらみこ": { img: "sakura_miko.jpg", ch: "UC-hM6YJuNYVAmUWxeIr9FeA" },
        "星街すいせい": { img: "hoshimachi_suisei.jpg", ch: "UC5CwaMl1eIgY8h02uZw7u8A" },
        "夜空メル": { img: "yozora_mel.jpg", ch: "UCD8HOxPs4Xvsm8H0ZxXGiBw" },
        "アキ・ローゼンタール": { img: "aki_rosenthal.jpg", ch: "UCFTLzh12_nrtzqBPsTCqenA" },
        "赤井はあと": { img: "haachama.jpg", ch: "UC1CfXB_kRs3C-zaeTG3oGyg" },
        "白上フブキ": { img: "shirakami_fubuki.jpg", ch: "UCdn5BQ06XqgXoAxIhbqw5Rg" },
        "夏色まつり": { img: "natsuiro_matsuri.jpg", ch: "UCQ0UDLQCjY0rmuxCDE38FGg" },
        "湊あくあ": { img: "minato_aqua.jpg", ch: "UC1opHUrw8rvnsadT-iGp7Cg" },
        "紫咲シオン": { img: "murasaki_shion.jpg", ch: "UCXTpFs_3PqI41qX2d9tL2Rw" },
        "百鬼あやめ": { img: "nakiri_ayame.jpg", ch: "UC7fk0CB07ly8oSl0aqKkqFg" },
        "癒月ちょこ": { img: "yuzuki_choco.jpg", ch: "UC1suqwovbL1kzsoaZgFZLKg" },
        "大空スバル": { img: "oozora_subaru.jpg", ch: "UCvzGlP9oQwU--Y0r9id_jnA" },
        "大神ミオ": { img: "ookami_mio.jpg", ch: "UCp-5t9SrOQwXMU7iIjQfARg" },
        "猫又おかゆ": { img: "nekomata_okayu.jpg", ch: "UCvaTdHTWBGv3MKj3KVqJVCw" },
        "戌神ころね": { img: "inugami_korone.jpg", ch: "UChAnqc_AY5_I3Px5dig3X1Q" },
        "兎田ぺこら": { img: "usada_pekora.jpg", ch: "UC1DCedRgGHBdm81E1llLhOQ" },
        "潤羽るしあ": { img: "uruha_rushia.jpg", ch: "UCl_gCybOJRIgOXw6Qb4qJzQ" },
        "不知火フレア": { img: "shiranui_flare.jpg", ch: "UCvInZx9h3jC2JzsIzoOebWg" },
        "白銀ノエル": { img: "shirogane_noel.jpg", ch: "UCdyqAaZDKHXg4Ahi7VENThQ" },
        "宝鐘マリン": { img: "housyou_marine.jpg", ch: "UCCzUftO8KOVkV4wQG1vkUvg" },
        "天音かなた": { img: "amane_kanata.jpg", ch: "UCZlDXzGoo7d44bwdNObFacg" },
        "桐生ココ": { img: "kiryu_coco.jpg", ch: "UCS9uQI-jC3DE0L4IpXyvr6w" },
        "角巻わため": { img: "tsunomaki_watame.jpg", ch: "UCqm3BQLlJfvkTsX_hvm0UmA" },
        "常闇トワ": { img: "tokoyami_towa.jpg", ch: "UC1uv2Oq6kNxgATlCiez59hw" },
        "姫森ルーナ": { img: "himemori_luna.jpg", ch: "UCa9Y57gfeY0Zro_noHRVrnw" },
        "獅白ぼたん": { img: "shishiro_botan.jpg", ch: "UCUKD-uaobj9jiqB-VXt71mA" },
        "雪花ラミィ": { img: "yukihana_lamy.jpg", ch: "UCFKOVgVbGmX65RxO3EtH3iw" },
        "尾丸ポルカ": { img: "omaru_polka.jpg", ch: "UCK9V2B22uJYu3N7eR_BT9QA" },
        "桃鈴ねね": { img: "momosuzu_nene.jpg", ch: "UCAWSyEs_Io8MtpY3m-zqILA" },
        "魔乃アロエ": { img: "mano_aloe.jpg", ch: "UCYq8Zfxf9iYTci5EGEGnkLw" },
        "ラプラス": { img: "laplus_darknesss.jpg", ch: "UCENwRMx5Yh42zWpzURebzTw" },
        "鷹嶺ルイ": { img: "takane_lui.jpg", ch: "UCs9_O1tRPMQTHQ-N_L6FU2g" },
        "博衣こより": { img: "hakui_koyori.jpg", ch: "UC6eWCld0KwmyHFbAqK3V-Rw" },
        "風真いろは": { img: "kazama_iroha.jpg", ch: "UC_vMYWcDjmfdpH6r4TTn1MQ" },
        "沙花叉クロヱ": { img: "sakamata_chloe.jpg", ch: "UCIBY1ollUsauvVi4hW4cumw" }
    }
}
